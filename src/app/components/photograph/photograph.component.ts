import { Component, OnInit, Input, DoCheck, Output, EventEmitter, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { ModalDirective } from 'ngx-bootstrap/modal/modal.component';
import { Material, Materials } from '../../model/material';
import { ProjectService } from '../../service/project.service';
import { InitMaterialService } from '../../service/init-material.service';
import { MachineService } from '../../service/machine.service';
import { environment } from '../../../environments/environment';
import { set } from 'd3';
import { setTestabilityGetter } from '@angular/core/src/testability/testability';

@Component({
  selector: 'app-photograph',
  templateUrl: './photograph.component.html',
  styleUrls: ['./photograph.component.scss'],
  providers: [InitMaterialService, MachineService]
})
export class PhotographComponent implements OnInit, DoCheck {
  @Input() isMatterList: boolean;
  @Input() isIdent: boolean;
  @Input() sceneCarme: boolean;
  @Input() identList;
  @Input() photoTitle: string;
  @Input() currentIdentItem;
  @Input() materialPage: number;

  @Output() onSelect = new EventEmitter<number>();

  @ViewChild(ModalDirective) public modal: ModalDirective;
  @Input() deviceId: string;
  @Input() showDevice: string;
  @Output() captureData = new EventEmitter<any>();

  @Output() hiddenModal = new EventEmitter<any>();
  @Output() shownModal = new EventEmitter<any>();
  @Input() index: number;

  private plugin: any;
  private view: any;
  private device: any;
  private video: any;
  private imageData: any;
  private isDeskew: boolean;
  private isFacePicture: boolean;
  private identListOverCount: number;

  @Input() Photo: any;

  public hasPhoto = false;

  private materials;
  private materialOverCount: number;
  private currentPhoto;
  private initMaterialList;

  constructor(
    private modalService: BsModalService,
    private _project: ProjectService,
    private initMaterial: InitMaterialService,
    private machineService: MachineService
  ) { }

  ngOnInit() {
    this.initMaterialList = this.initMaterial.getInitMaterial()
    this.isDeskew = false;
    this.isFacePicture = false;

    this.identListOverCount = 0
    if (this.isIdent) {
      this.identList.map(v => {
        if (v.active === 'success') {
          this.identListOverCount++
        }
      })
    }
  }

  ngDoCheck() {
    if (this.materialPage !== undefined) {
      this.materials = null;
      this.materials = this._project.getMaterialPage(this.materialPage);
      this.materialOverCount = 0;

      if (this.materials === undefined) {
        return
      }

      this.materials.pages.map(v => {
        if (v.pic !== '') {
          this.materialOverCount++
        }
      })
      this.currentPhoto = this.materials.pages[this.index]
    }
  }

  selectedIdent(i: number): void {
    this.onSelect.emit(i)
  }
  public getWaterText() {
    let checkcode = window.localStorage.getItem('CHECKCODE');
    if (checkcode) {
      checkcode += '-' + new Date().getMilliseconds();
    }
    return checkcode;
  }
  public AddText() {
    const text = this.getWaterText();
    const font = this.plugin.Global_CreateTypeface(200, 200, 0, 0, 2, 0, 0, 0, '楷体');
    this.plugin.Video_EnableAddText(this.video, font, 20, 0, text, 65280, 150);
    this.plugin.Font_Release(font);
  }

  public setDeskew(b) {
    this.isDeskew = b || false;
  }
  public showDeskew() {
    if (this.isDeskew) {
      this.plugin.Video_EnableDeskew(this.video, 1);
    } else {
      this.plugin.Video_DisableDeskew(this.video);
    }
    // this.AddText();
  }
  /* public setFacePicture() {
    this.isFacePicture = true;
    this.plugin.Global_EnableFaceRectCrop(this.video, 1);
  } */

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

  public onShown(): void {
    const me = this;
    me.loadPlugin();
    me.loadView();
    me.plugin.Global_SetWindowName(me.deviceId);
    me.view.View_SetText('正在打开设备,请稍等...', 0);

    const lastTime: any = localStorage.getItem('_HighShotLastTime_') || new Date().getTime();
    const isOpen = (new Date().getTime() - lastTime > 300 * 1000) ? false : true;
    if (localStorage.getItem('_HighShotVideo_') && isOpen) {
      me.device = localStorage.getItem('_HighShotCamera_');
      me.video = localStorage.getItem('_HighShotVideo_');
      if (me.video) {
        try {
          me.plugin.Device_SetCameraControl(me.device, 0x1, -6, false);
          const v = me.plugin.Device_GetCameraControl(me.device, 0x1, 0x5); // 最小值-13 最大值-1 步长1 默认值-6 实际值-6 是否自动1
          me.view.View_SelectVideo(me.video);
          me.showDeskew();
        }catch (e) {
          me.close();
          setTimeout(() => {
            me.shownModal.emit();
          }, 1500);
        }
      }
    }else {
      me.open();
    }
  }
  public open() {
    const me = this;
    me.addEvent('DevChange', (type, idx, dbt) => {
      if (dbt === 2) {
        console.log('设备丢失,请检查是否正常链接...');
      }
      if (type === 1) {
        const dev = me.plugin.Global_CreateDevice(type, idx);
        if (dev) {
          const name = me.plugin.Device_GetFriendlyName(dev);
          if (name.startsWith(me.showDevice)) {
            me.device = dev;
            me.plugin.Device_SetCameraControl(me.device, 0x1, -6, false);
            // const nResolution = me.plugin.Device_GetResolutionCountEx(me.device, 0);
            // const subType = me.plugin.Device_GetSubtype(me.device);
            me.video = me.plugin.Device_CreateVideo(me.device, 0, 0);
            if (me.video) {
              me.view.View_SelectVideo(me.video);
              me.showDeskew();
            }
            localStorage.setItem('_HighShotVideo_', me.video);
            localStorage.setItem('_HighShotCamera_', me.device);
            localStorage.setItem('_HighShotDevice_', me.deviceId);
          } else {
            me.plugin.Device_Release(dev);
          }
        }
      }
    });
    if (me.plugin.Global_InitDevs()) {
      // me.plugin.InitFaceDetect();
    }
    if (!me.plugin.Global_VideoCapInit()) {
      console.log('初始化失败');
    };
  }
  public close() {
    try {

      /* if (this.video) {
        this.plugin.Video_Release(this.video);
        this.view.View_SetText('', 0);
        this.video = null;
      }
      if (this.device) {
        this.plugin.Device_Release(this.device);
        this.device = null;
      } */
      localStorage.setItem('_HighShotVideo_', '');
      this.plugin.Global_DeinitDevs();
      // this.plugin.Global_DeinitFaceDetect();
    }catch (e) {
    }
    this.hiddenModal.emit();
  }
  public onHide(): void {
    // this.close();
    this.index = 0;
    localStorage.setItem('_HighShotLastTime_', new Date().getTime() + '');
  }

  public capture(): any {
    const data = this.captureImage();
    if (data) {
      this.modal.hide();
    }
  }

  public captureImage(): any {
    const me = this;
    const image = this.plugin.Video_CreateImage(this.video, 0, this.view.View_GetObject());
    if (image) {
      const base64 = this.plugin.Image_GetBase64(image, 2, 0);
      this.imageData = 'data:image/jpg;base64,' + base64;
      this.plugin.Image_Release(image);
    }
    this.captureData.emit(this.imageData);
    this.Photo = this.imageData;
    this.hasPhoto = true;
    // 判断：如果当前材料类型未创建，直接返回
    if (!this.materials.pages[this.index]) {
      return;
    }
    this.machineService.uploadImage(me.imageData, 'image/jpeg', function(data){
      if (data.error === 0) {
         // 拿到当前拍摄时间
        const day = me.getDate();
        // 当前拍摄的材料照片以及当前拍摄时间 赋值给初始材料类型
        me.materials.pages[me.index].picURL = environment.ctxpath + data.url;
        me.materials.pages[me.index].pic = data.fileId;
        me.materials.pages[me.index].updatetime = day;
        // 当前材料拍摄完成 将材料信息赋值给一个变量保存当前材料信息
        me.currentPhoto = me.materials.pages[me.index];
        // me._project.getProject().materialPageHasPic.push(me.currentPhoto)
        // me._project.getProject().materialPageHasPic = Array.from(new Set(me._project.getProject().materialPageHasPic))
        // 进入下一张材料拍摄
        me.index ++;
        // 如果当前拍摄的下标和初始材料总和相等 则下标保持不变（为最新下标）
        if (me.index === me.materials.pages.length) {
          me.index = me.materials.pages.length - 1;
        };
        setTimeout(() => {
          me.redirctMaterialClient(null);
        }, 5000);
      } else {
        // 错误处理
      }
    }, function(progress){
      // 上传进度
    });
    return this.imageData;
  }

  // 获取当前年月日时分秒
  private getDate(): string {
    const date = new Date()
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }

  /* public faceDetect(image1, image2): any {
    let d = -1;
    if (image1 && image2) {
      const s = 'data:image/jpg;base64,';
      image1 = image1.replace(s, '');
      image2 = image2.replace(s, '');
      const i1 = this.plugin.Global_CreateImageFromBase64(image1, 0);
      const i2 = this.plugin.Global_CreateImageFromBase64(image2, 0);
      d = this.plugin.DiscernFaceDetect(i1, i2);
      if (d !== -1) {
        d += 20;
        if (d > 100) {
          d = 100;
        }
      }
    }
    return d;
  } */

  // 删除当前点击的材料
  private deletePhoto(i: number, item): void {
    // 如果材料已经删除 点击删除按钮无效 直接返回
    if (item.pic === '') {
      return;
    }
    this.index = i
    // 删除成功 初始化材料照片值赋为空
    item.pic = ''
    item.picURL = ''

    // 删除完毕 将当前材料信息赋值给变量保存
    this.currentPhoto = item
  }

  // 新增一个材料
  private addMaterial(): void {
    // 初始化材料信息增加一个
    this.materials.pages.push({
      id: '',
      name: '新增材料',
      picURL: '',
      pic: '',
      isCustom: true,
      updatetime: this.getDate(),
      status: 'wait',
      result: {}
    })

    // 将最新增加的材料下标赋值给index
    this.index = this.materials.pages.length - 1

    // 同上 将当前材料信息赋值给变量保存
    this.currentPhoto = this.materials.pages[this.index]
  }

  // 设置当前材料变量 保存当前材料信息
  private setCurrent(i: number, item): void {
    this.index = i
    this.currentPhoto = item
  }

  // private addMaterialClass(event): void {
  //   event.stopPropagation()
  //   let material = document.getElementsByClassName('matter-frame');
  //   for (let i = 0; i < material.length; i++) {
  //     material[i].className = 'matter-frame'
  //   }
  //   event.currentTarget.className = 'matter-frame matter-frame-active'
  // }
  private redirctMaterialClient(i) {
    if (this.materials && this.materials.pages.length > 0) {
      if (!i) {
        i = this.materials.pages.length < this.index ? this.materials.pages.length : this.index;
      }
      const page = this.materials.pages[i];
      const caseId = window.localStorage.getItem('caseId');
      this.machineService.redirect('stuff', null, {caseId: caseId, stuffFileId: page.id});
    }
  }
}
