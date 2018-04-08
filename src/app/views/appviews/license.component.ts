import { Component, OnInit } from '@angular/core';
import { Http, Headers, URLSearchParams, QueryEncoder } from '@angular/http';
import { Router } from '@angular/router';
import { MetaLoader } from 'app/service/meta-loader.service';
import { environment } from '../../../environments/environment';
import { MachineService } from '../../service/machine.service';
import { RestClient } from '../../service/rest-client.service';
import { Device } from '../../model/device';
@Component({
  selector: 'app-license',
  templateUrl: 'license.template.html',
  styleUrls: ['./license.component.scss'],
  providers: [MachineService]
})

export class LicenseComponent implements OnInit {

  public device: Device = new Device();
  public step: number;
  public errorMessage: string;
  public formMessage: string;
  public registerName: string;
  public frontScreen: DeviceLicense;
  public backScreen: DeviceLicense;

  public notaryoffice: Object = {};
  public selectPlace: Object = {};
  constructor(private machineService: MachineService, private http: Http,
    private restClient: RestClient, private router: Router) { }

  ngOnInit() {
    this.registerName = '正在检查...';
    this.formMessage = '';
    this.step = 1;
    this.machineService.frontLicenseNumber().then(res => {
      this.frontScreen = new DeviceLicense(res.data.number, res.data.ip || '10.110.25.155');
    }).catch(err => {
      this.step = 4;
      this.errorMessage = '请检查设备服务是否开启';
    });
    this.machineService.backLicenseNumber().then(res => {
      this.backScreen = new DeviceLicense(res.data.number, res.data.ip || '10.110.25.155');
      this.checkDevice();
    }).catch(err => {
      this.step = 4;
      this.errorMessage = '请检查设备服务是否开启';
    });
    this.notaryoffice = MetaLoader.CURRENT_NOTARYOFFICE;
  }

  checkDevice(): void {
    const me = this;
    const headers = new Headers({'X-CSRF-TOKEN': MetaLoader.CSRF_TOKEN });
    const params = new URLSearchParams('', new GhQueryEncoder());
    params.set('license', this.backScreen.license);
    this.http.post(RestClient.getCollectionURL('npm.MachineRegist', 'check'), params, { headers: headers }).toPromise()
    .then(res => {
      const data = res.json();
      if (data.code === 1) {
        this.registerName = '已激活';
        setTimeout(() => {
          // 这里判断用户是否登录，未登录跳转到登录页面
          if (MetaLoader.CURRENT_USER == null || MetaLoader.CURRENT_USER.anonymous) {
            me.router.navigateByUrl('/login');
          }else {
            me.router.navigateByUrl('/dashboard');
          }
        }, 1000);
      }else if (data.code === 3) {
        this.step = data.code;
      }else if (data.code === 4) {
        this.step = data.code;
        this.errorMessage = data.description;
      }else {
        this.registerName = '点击激活';
      }
    }).catch(err => {});
  }

  register(): void {
    if (this.registerName === '已激活' || this.registerName === '正在检查...') {
      return;
    }
    this.step = 2;
  }

  submit(): void {
    const me = this;
    if (!this.device.notaryPlace || !this.device.notaryRoom) {
      this.formMessage = '公证点和公证室不能为空';
      return;
    }
    this.device.frontScreenIP = this.frontScreen.ip;
    this.device.backScreenIP = this.backScreen.ip;
    this.device.serialNumber = this.backScreen.license;
    this.device.notaryOffice = this.notaryoffice['id'];
    const headers = new Headers({'X-CSRF-TOKEN': MetaLoader.CSRF_TOKEN });
    this.http.post(RestClient.getCollectionURL('npm.MachineRegist', 'register'), {'device': this.device}, { headers: headers }).toPromise()
    .then(res => {
      const data = res.json();
      if (data.code === 1) {
        me.step = 3;
      }else {
        me.formMessage = data.description;
      }
    }).catch(err => {
      me.formMessage = '激活出错了，请稍后重试.';
    });
  }
  placeChange(e): void {
    this.formMessage = '';
    const value = e.target.value;
    const places = this.notaryoffice['places'];
    if (value) {
      for (const i in places) {
        if (places[i]['id'] === value) {
          this.selectPlace = places[i];
        }
      }
    }else {
      this.selectPlace = {};
    }
  }

  roomChange(e): void {
    this.formMessage = '';
  }
}

class DeviceLicense {
  license: string;
  ip: string;
  constructor (license: string, ip: string) {
    this.license = license;
    this.ip = ip;
  }
}
class GhQueryEncoder extends QueryEncoder { // encode + plus sign
  encodeKey(k: string): string {
      k = super.encodeKey(k);
      return k.replace(/\+/gi, '%2B');
  }
  encodeValue(v: string): string {
      v = super.encodeKey(v);
      return v.replace(/\+/gi, '%2B');
  }
}
