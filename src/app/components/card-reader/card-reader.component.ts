import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { MachineService } from './../../service/machine.service';

@Component({
  selector: 'app-card-reader',
  templateUrl: './card-reader.component.html',
  styleUrls: ['./card-reader.component.scss'],
  providers: [MachineService]
})
export class CardReaderComponent implements OnInit {
  @Input() deviceId: string;
  @Input() clear: boolean;
  @Output() idCard = new EventEmitter<any>();

  private isAnimate: boolean;
  private hasInfo: boolean;
  private error: boolean;
  private plugin: any;
  private view: any;

  private device: any;
  private video: any;

  constructor(private machineService: MachineService) {}

  ngOnInit() {
    this.error = false;
    this.hasInfo = true;
  }

  private addEvent(name, func) {
    if (this.plugin != null && this.plugin.attachEvent) {
      this.plugin.attachEvent('on' + name, func);
    } else {
      this.plugin.addEventListener(name, func, false);
    }
  }

  private loadPlugin(): void {
    this.plugin = document.getElementById(this.deviceId);
  }

  private loadView(): void {
    this.view = document.getElementById(this.deviceId);
  }

  public startReader(): any {
    this.isAnimate = true;
    const me = this;
    setTimeout(() => {
      me.loadPlugin();
      me.loadView();
      me.plugin.Global_SetWindowName(me.deviceId);
      me.view.View_SetText('正在打开设备,请稍等...', 0);
      me.addEvent('DevChange', (type, idx, dbt) => {
        if (dbt === 2) {
          console.log('设备丢失,请检查是否正常链接...');
        }
        const dev = me.plugin.Global_CreateDevice(type, idx);
        if (dev) {
          this.hasInfo = false;
          this.isAnimate = false;
          const name = me.plugin.Device_GetFriendlyName(dev);
          const displayName = me.plugin.Device_GetDisplayName(dev);
          const eloamType = me.plugin.Device_GetEloamType(dev);
          if (type === 1 && name === 'T882') {
            me.device = dev;
            const nResolution = me.plugin.Device_GetResolutionCountEx(me.device, 0);
            const subType = me.plugin.Device_GetSubtype(me.device);
            me.video = me.plugin.Device_CreateVideo(me.device, nResolution, subType);
            if (me.video) {
              me.view.View_SelectVideo(me.video);
            }
            localStorage.setItem('_HighShotDevice_', me.deviceId);
          }else {
            me.plugin.Device_Release(dev);
          }
        }
      });
      if (me.plugin.Global_InitDevs()) {
        me.plugin.InitFaceDetect();
      }
      if (!me.plugin.Global_VideoCapInit()) {
        console.log('初始化失败');
      }
      let count = 0;
      const t = setInterval(() => {
        if (count > 20) {
          clearInterval(t);
          me.idCard.emit(null);
          return ;
        }
        const info = me.readIDCard();
        if (info) {
          clearInterval(t);
          me.idCard.emit(info);
        } else {
          count ++;
        }
      }, 1000);
    }, 500);
  }

  public stopReader(): any {
    if (this.video) {
        this.plugin.Video_Release(this.video);
        this.view.View_SetText('', 0);
        this.video = null;
    }
    if (this.device) {
      this.plugin.Device_Release(this.device);
      this.device = null;
    }
    this.plugin.Global_DeinitDevs();
    this.plugin.Global_DeinitFaceDetect();
  }

  private readIDCard(): any {
    const r = {};
    if (this.plugin.Global_InitIdCard()) {
      const ret = this.plugin.Global_ReadIdCard();
      if (ret) {
        r['name'] = this.plugin.Global_GetIdCardData(1);
        r['gender'] = this.plugin.Global_GetIdCardData(2);
        r['nation'] = this.plugin.Global_GetIdCardData(3);
        r['birthday'] = this.plugin.Global_GetIdCardData(4) + '-' +
         this.plugin.Global_GetIdCardData(5) + '-' +
         this.plugin.Global_GetIdCardData(6) + '-';
        r['address'] = this.plugin.Global_GetIdCardData(7);
        r['idNumber'] = this.plugin.Global_GetIdCardData(8);
        r['organization'] = this.plugin.Global_GetIdCardData(9);
        r['startDate'] = this.plugin.Global_GetIdCardData(10) + '-' +
         this.plugin.Global_GetIdCardData(11) + '-' +
         this.plugin.Global_GetIdCardData(12);
        r['dueDate'] = this.plugin.Global_GetIdCardData(13) + '-' +
        this.plugin.Global_GetIdCardData(14) + '-' +
        this.plugin.Global_GetIdCardData(15);
        const image = this.plugin.Global_GetIdCardImage(1);
        const base64 = this.plugin.Image_GetBase64(image, 2, 0);
        if (base64) {
          r['photo'] =  base64;
        }
        const logo = this.plugin.Global_GetIdCardImage(2);
        const base64logo = this.plugin.Image_GetBase64(logo, 2, 0);
        if (base64logo) {
          r['logo'] = base64logo;
        }
      }
      this.plugin.Global_DeinitIdCard();
      setTimeout(() => {
        this.stopReader();
      }, 500);
    } else {
      console.log('init idcard is faile!');
    }
    return r;
  }

  private readIDCardForUrl(): any {
    const me = this;
    this.error = false;
    this.isAnimate = true;
    this.machineService.frontIdReader().then(res => {
      console.log(res);
      if (res.result && res.result === 'Success') {
        me.idCard.emit(res.data);
      } else {
        this.isAnimate = false;
        this.error = true;
      }
    }).catch(error => {
      this.isAnimate = false;
      this.error = true;
    });
    // this.machineService.frontBrowserRedirect('http://www.homolo.com');
  }
}
