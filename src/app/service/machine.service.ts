/**一体机处理类 */
import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import {HttpEvent, HttpEventType, HttpInterceptor,
  HttpHandler, HttpRequest, HttpResponse, HttpClient, HttpHeaders} from '@angular/common/http';
import { MetaLoader } from '../service/meta-loader.service';
import { environment } from '../../environments/environment';

import 'rxjs/add/operator/toPromise';
import { Promise } from 'q';
/**申请人页面所对应的url地址 */
const redirectData = {
  'welcome': '/home',
  'badge': '/badge', // /badage/:<公证员personId>
  'stuff': '/data',
  'tips': '/tips', // /tips/:<案件ID>
  'note': '/note', // /note/:<问题ID>
  'notes': '/notes', // /notes/:<笔录确认ID>
  'ident': '/ident', // /ident?xxxxxx<案件ID和申请人ID>
  'charge': '/charge', // /charge/:<案件ID>
  'project': '/project', // /project/:<案件ID>
  'read': '/cardident', // /cardident?id=xx
  'guide': '/guide'
}

@Injectable()
export class MachineService {
  private headers = new Headers({'content-Type': 'application/json'});
  private machineUrl = environment.machineUrl;
  private clientUrl = environment.clientUrl;
  private waitTimeout = 15;
  constructor(
    private http: Http,
    private httpClient: HttpClient
  ) { }

  public redirect(action, id, params) {
    if (!redirectData[action]) {
      return;
    }
    let path = this.clientUrl + '/#' + redirectData[action];
    if (id) {
      path += '/' + id;
    }
    let url = path;
    if (params) {
      url = this.http_builder_url(path, params);
      url += '&t=' + new Date().getTime();
    } else {
      url += '?t=' + new Date().getTime();
    }
    this.browserRedirect(url);
    // this.sendAction(url).then(res => {});
  }

  private http_builder_url(url, data) {
    if (typeof(url) === 'undefined' || url == null || url === '') {
      return '';
    }
    if (typeof(data) === 'undefined' || data == null || typeof(data) !== 'object') {
        return '';
    }
    url += (url.indexOf('?') !== -1) ? '' : '?';
    for (const i in data) {
      if ((url.indexOf('=') !== -1)) {
        url += '&' + i + '=' + encodeURI(data[i]);
      }else {
        url += '&' + i + '=' + encodeURI(data[i]);
      }
    }
    return url;
  }
  /**
   * 测试
   * @param action
   */
  public sendAction(url) {
    return this.http
      .get(environment.serverUrl + '/wstest/do.jsp?address=ac2224d245bdcc95a3c52233dd732069&action=' + encodeURIComponent(url),
      {headers: this.headers})
      .toPromise()
      .then()
      .catch()
  }

  private getBlobBydataURI(base64, type): any {
    const binary = atob(base64.split(',')[1]);
    const array: any[] = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: type });
  }
  /**
   * 上传图片
   * @param data
   * @param miniType
   * @param callback
   */
  public uploadImage(data, miniType, callback, progresscallback) {
    const $Blob = this.getBlobBydataURI(data, miniType);
    const formData = new FormData();
    formData.append('files', $Blob , 'file_' + new Date().getTime() + '.jpeg');
    const headers = new HttpHeaders().set('X-CSRF-TOKEN', MetaLoader.CSRF_TOKEN);
    const req = new HttpRequest('POST', environment.restServiceUrl + 'tk.File/collection/upload', formData, {
      reportProgress: true,
      headers: headers
    });
    this.httpClient.request(req).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress) {
        const percentDone = Math.round(100 * event.loaded / event.total);
        console.log(`File is ${percentDone}% uploaded.`);
        progresscallback(percentDone);
      } else if (event instanceof HttpResponse) {
        console.log('File is completely uploaded!', event);
        callback(event.body);
      }
    });
  }
  /**
   *读取身份证
   */
  public frontIdReader() {
    return this.http
           .post(this.machineUrl + '/dev/FrontIdReader/read', JSON.stringify({'timeout': this.waitTimeout}),
           {headers: this.headers})
           .toPromise()
           .then(res => res.json())
           .catch(error => error.json())
  }
  public backIdReader() {
    return this.http
           .post(this.machineUrl + '/dev/BackIdReader/read', JSON.stringify({'timeout': this.waitTimeout}),
           {headers: this.headers})
           .toPromise()
           .then(res => res.json())
           .catch(error => error.json())
  }
  /**
   * 人脸识别(身份证头像和摄像头拍照头像对比)
   */
  public frontCompareFace() {
    const obj = {'threshold': 70, 'refresh': true, 'timeout': this.waitTimeout};
    return this.http
    .post(this.machineUrl + '/dev/FrontCamera/compareFace', JSON.stringify(obj),
    {headers: this.headers})
    .toPromise()
    .then(res => res.json())
    .catch(error => error.json())
  }
  /**
   * 人脸识别(身份证头像和摄像头拍照头像对比)
   */

  public backCompareFace(face: string) {
    const obj = {'threshold': 70, 'timeout': this.waitTimeout};
    if (face) {
      obj['face1'] = face;
      obj['refresh'] = false;
    } else {
      obj['refresh'] = true;
    }
    return this.http
    .post(this.machineUrl + '/dev/BackCamera/compareFace', JSON.stringify(obj),
    {headers: this.headers})
    .toPromise()
    .then(res => res.json())
    .catch(error => error.json())
  }
  /**
   * 指纹识别(身份证指纹和当场采集的指纹对比)
   */
  public frontCompareFinger() {
    return this.http
    .post(this.machineUrl + '/dev/FrontFinger/compare', JSON.stringify({'threshold': 60, 'timeout': this.waitTimeout, 'refresh': true}),
    {headers: this.headers})
    .toPromise()
    .then(res => res.json())
    .catch(error => error.json())
  }
  public backCompareFinger() {
    return this.http
    .post(this.machineUrl + '/dev/BackFinger/compare', JSON.stringify({'threshold': 60, 'timeout': this.waitTimeout, 'refresh': true}),
    {headers: this.headers})
    .toPromise()
    .then(res => res.json())
    .catch(error => error.json())
  }

  public browserRedirect(path: string) {
    if (MetaLoader.DEVICE_KEY) {
      return this.http
      .post(this.machineUrl + '/dev/browser/redirect', JSON.stringify({'url': path}),
      {headers: this.headers})
      .toPromise()
      .then(res => res.json())
      .catch(error => error.json())
    }
  }

  public frontLicenseNumber() {
    return this.http
    .get(this.machineUrl + '/api/frontLicenseNumber',
    {headers: this.headers})
    .toPromise()
    .then(res => res.json())
    .catch(error => error.json())
  }

  public backLicenseNumber() {
    return this.http
    .get(this.machineUrl + '/api/backLicenseNumber',
    {headers: this.headers})
    .toPromise()
    .then(res => res.json())
    .catch(error => error.json())
  }

  public videoRecord(sessionId: string, action: string) {
    return this.http
    .post(this.machineUrl + '/api/videoRecord', JSON.stringify({'sessionId': sessionId, 'actionControl': action}),
    {headers: this.headers})
    .toPromise()
    .then(res => res.json())
    .catch(error => error.json())
  }

  public actionRecord(action: string, validate: string, checkcode: string, actionControl: string) {
    const sessionId = window.localStorage.getItem('__sessionId__');
    return this.http
    .post(this.machineUrl + '/api/actionRecord', JSON.stringify({'sessionID': sessionId, 'caseCode': checkcode, 'actionNum': '',
     'actionName': '', 'actionControl': actionControl}),
    {headers: this.headers})
    .toPromise()
    .then(res => res.json())
    .catch(error => error.json())
  }
}
