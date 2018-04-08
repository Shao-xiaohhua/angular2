import { Component, OnInit } from '@angular/core';
import { Http, Headers, URLSearchParams, QueryEncoder } from '@angular/http';
import { keyEncrypt } from '../../app.helpers';
import { Router } from '@angular/router';
import 'rxjs/add/operator/toPromise';

import { User } from '../../model/user';
import { RestClient } from '../../service/rest-client.service';
import { MetaLoader } from '../../service/meta-loader.service';
import { MachineService } from '../../service/machine.service';
import { environment } from '../../../environments/environment';

declare var CertFounder: any;

@Component({
  selector: 'app-login-two',
  templateUrl: './login-two.template.html',
  styleUrls: ['./login-two.component.scss'],
  providers: [MachineService]
})

export class LoginTwoComponent implements OnInit {
  certFounder: any = new CertFounder();
  csrfToken: string;
  notary: Notary = new Notary();
  errorMessage: string;
  resultUser: object;
  private step: number;
  private recFace: string;
  private recFlag: boolean;
  private recErrorMessage: string;
  notaryoffice: Object;
  captchaUrl = environment.serverUrl + '/Kaptcha.jpg';
  constructor(
    private metaLoader: MetaLoader,
    private http: Http,
    private restClient: RestClient,
    private machineService: MachineService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.recFlag = true;
    this.step = 1;
    const me = this;

    if (MetaLoader.CSRF_TOKEN == null) {
      this.http.get(RestClient.getCollectionURL('fw.System', 'csrf')).toPromise()
        .then(response => this.csrfToken = response.json().result)
        .catch(err => {});
    } else {
      this.csrfToken = MetaLoader.CSRF_TOKEN;
    }
    this.notaryoffice = MetaLoader.CURRENT_NOTARYOFFICE;
    me.certFounder.onfound = function (cn) {
     me.checkInfo(cn);
    }
    me.certFounder.onlost = function () {
      me.step = 1;
    }
    me.certFounder.start();
    this.machineService.redirect('welcome', null, null)
  }

  refreshCode(): void {
    this.captchaUrl = environment.serverUrl + '/Kaptcha.jpg?v=' + new Date().getTime();
  }

  private next(): void {
    this.errorMessage = null;
    if (!this.notary.password) {
      this.errorMessage = '请输入密码';
      return;
    }
    this.checkPassword();
  }

  private reset(): void {
    this.recFlag = true;
    this.recErrorMessage = '';
    this.compareFace();
  }

  checkInfo(cn): void {
    const me = this;
    const headers = new Headers({'X-CSRF-TOKEN': this.csrfToken });
    this.http.post(environment.restServiceUrl + 'npm.CAService/collection/checkInfo', {'ca': cn}, { headers: headers })
      .toPromise()
      .then(res => {
        const r = res.json();
        if (r.code === 1 && r.result) {
          me.notary =  r.result;
          me.step = 2;
        }else {
          console.log(res);
        }
      })
      .catch(err => {
        console.log(err.json());
      });
  }
  checkPassword(): void {
    const me = this;
    const headers = new Headers({'X-CSRF-TOKEN': this.csrfToken });
    const encryptedPass = keyEncrypt(this.notary.password);
    this.http.post(environment.restServiceUrl + 'npm.CAService/collection/checkPassword',
    {'userName': this.notary.userName, 'password': encryptedPass, 'code': this.notary.code}, { headers: headers })
      .toPromise()
      .then(res => {
        const r = res.json();
        if (r.code === 1) {
          me.step = 3;
          me.compareFace();
        }else {
          this.errorMessage = r.description;
        }
      })
      .catch(err => {
        console.log(err.json());
        this.errorMessage = err.message;
      });
  }
  compareFace(): void {
    const me = this;
    const timer = setTimeout(() => {
      me.recFlag = false;
      me.recErrorMessage = '识别失败,请重新识别!';
    }, 15000);
    this.machineService.backCompareFace(me.notary.portrait).then(({result, data}) => {
      if (result) {
        clearTimeout(timer);
        if (result === 'Success') {
          console.log(result, data);
          if (data && data.simDegree >= 70) {
            me.onSubmit();
          } else {
            me.recFlag = false;
            me.recFace = data.photoCompared;
            me.recErrorMessage = '匹配度过低，请对准摄像头！';
          }
        } else {
          me.recFlag = false;
          me.recErrorMessage = '识别失败,请重新识别!';
        }
      }
    }).catch(error => {
      clearTimeout(timer);
      me.recFlag = false;
      me.recErrorMessage = '识别失败,请重新识别!';
    });
  }
  onSubmit(): void {
    const me = this;
    this.errorMessage = null;
    const headers = new Headers({'X-CSRF-TOKEN': this.csrfToken });
    const params = new URLSearchParams('', new GhQueryEncoder());
    const encryptedPass = keyEncrypt(this.notary.password);
    params.set('username', this.notary.userName);
    params.set('password', encryptedPass);
    params.set('code', '');
    params.set('remember-me', 'off');
    params.set('responseType', 'json');
    this.http.post(environment.serverUrl + '/login', params, { headers: headers })
      .toPromise()
      .then(res => {
        if (res.url && res.url.endsWith('$=deny')) {
          this.errorMessage = '密码错误';
        } else {
          try {
            const data = res.json();
            if (data.code !== 200) {
              this.errorMessage = data.error || '密码错误';
            } else {
              const u = data.user;
              MetaLoader.CURRENT_USER = new User(u.userId, u.personId, u.userName, u.nickName, u.email, u.avatar, u.mobile, u.anonymous);
              if (MetaLoader.MENU != null) {
                MetaLoader.MENU.reloadRequired = true;
              }
              this.machineService.redirect('badge', MetaLoader.CURRENT_USER.personId, null);
              me.router.navigateByUrl('/dashboard');
            }
          } catch (error) {
            this.errorMessage = '密码错误';
          }
          console.log(res);
        }
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error); // for demo purposes only
    this.errorMessage = '请求失败，' + error.message;
    return Promise.reject(error.message || error);
  }
}


class Notary {
  name: string;
  portrait: string;
  userName: string;
  password: string;
  code: string;
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
