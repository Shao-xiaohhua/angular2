import { Component, Input, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { Http, Headers, URLSearchParams, QueryEncoder } from '@angular/http';
import { Router } from '@angular/router';
import { keyEncrypt } from '../../app.helpers';

import 'rxjs/add/operator/toPromise';

import { User } from '../../model/user';
import { MetaLoader } from '../../service/meta-loader.service';
import { RestClient } from '../../service/rest-client.service';
import { MachineService } from '../../service/machine.service';
import { environment } from '../../../environments/environment';

declare var CertFounder: any;

@Component({
  selector: 'app-login',
  templateUrl: 'login.template.html',
  styleUrls: ['./login.component.scss'],
  providers: [MachineService]
})
export class LoginComponent implements OnInit, OnDestroy {

  login: Login = new Login();
  errorMessage: string;
  csrfToken: string;
  captchaUrl = environment.serverUrl + '/Kaptcha.jpg';
  showCode = false;
  founder;
  notaryoffice: Object;
  constructor(private metaLoader: MetaLoader, private http: Http,
    private restClient: RestClient, private machineService: MachineService, private router: Router) {
  }

  ngOnInit(): void {
    const me = this;
    if (MetaLoader.CSRF_TOKEN == null) {
      this.http.get(RestClient.getCollectionURL('fw.System', 'csrf')).toPromise()
        .then(response => this.csrfToken = response.json().result)
        .catch(this.handleError);
    } else {
      this.csrfToken = MetaLoader.CSRF_TOKEN;
    }
    this.notaryoffice = MetaLoader.CURRENT_NOTARYOFFICE;
    this.founder = new CertFounder();
    this.founder.onfound = function (cn) {
      me.login.username = cn;
    }
    this.founder.onlost = function () {
      me.login.username = '';
    }
    this.founder.onerror = function (err) {
      console.log(err);
    }
    this.founder.start();
    this.machineService.redirect('welcome', null, null);
  }

  ngOnDestroy(): void {
    this.founder.stop();
  }

  refreshCode(): void {
    this.captchaUrl = environment.serverUrl + '/Kaptcha.jpg?v=' + new Date().getTime();
  }

  onSubmit(): void {
    this.errorMessage = null;
    const headers = new Headers({'X-CSRF-TOKEN': this.csrfToken });
    const params = new URLSearchParams('', new GhQueryEncoder());
    const encryptedPass = keyEncrypt(this.login.password);
    params.set('username', this.login.username);
    params.set('password', encryptedPass);
    params.set('code', this.login.code);
    params.set('remember-me', this.login.rememberMe ? 'on' : 'off');
    params.set('responseType', 'json');
    this.http.post(environment.serverUrl + '/login', params, { headers: headers })
      .toPromise()
      .then(res => {
        if (res.url && res.url.endsWith('$=deny')) {
          this.errorMessage = '登录失败，请检查您的用户名和密码';
        } else {
          try {
            const data = res.json();
            if (data.code !== 200) {
              this.errorMessage = data.error || '登录失败，请检查您的用户名和密码';
              this.showCode = data.showCode;
              if (true === data.codeError) {
                this.login.code = null;
              }
            } else {
              const u = data.user;
              MetaLoader.CURRENT_USER = new User(u.userId, u.personId, u.userName, u.nickName, u.email, u.avatar, u.mobile, u.anonymous);
              if (MetaLoader.MENU != null) {
                MetaLoader.MENU.reloadRequired = true;
              }
              this.machineService.redirect('badge', MetaLoader.CURRENT_USER.personId, null);
              this.router.navigateByUrl('/dashboard');
            }
          } catch (error) {
            this.router.navigateByUrl('/dashboard');
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

class Login {
  username: string;
  password: string;
  code: string;
  rememberMe: boolean;
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
