import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { environment } from '../../environments/environment';

import 'rxjs/add/operator/toPromise';
import { Promise } from 'q';

@Injectable()
export class OcrResultService {
  private headers = new Headers({'Content-Type': 'application/json'});
  private ocrUrl = environment.restServiceUrl + 'npm.CertificateCenterService/collection/ocrEduByBase64';

  constructor(
    private http: Http
  ) { }

  public getOcrResult(base) {
    return this.http
           .post(this.ocrUrl, JSON.stringify({'base64': base}), {headers: this.headers})
           .toPromise()
           .then(res => res.json())
           .catch(this.handleError)
  }

  private handleError(error): void {
    console.error('get ocr result: ' + error);
  }
}
