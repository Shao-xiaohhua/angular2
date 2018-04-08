import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class OcrYeildService {
  private ocrUrl = environment.restServiceUrl + 'npm.CertificateCenterService/collection/getEducation';

  constructor(
    private http: Http
  ) { }

  public ocrYeild(res) {
    const {xm, zsbh} = res;
    return this.http
           .get(`${this.ocrUrl}?xm=${xm}&zsbh=${zsbh}`)
           .toPromise()
           .then(data => res.json())
           .catch(this.handleError)
  }

  private handleError(error): void {
    console.error('ocr yeild: ' + error);
  }
}
