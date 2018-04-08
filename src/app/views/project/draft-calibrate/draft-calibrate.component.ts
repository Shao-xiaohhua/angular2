import { Type } from 'app/model/type';
import { from } from 'rxjs/observable/from';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SealService } from '../../../service/seal.service';
import { RestClient } from '.././../../service/rest-client.service';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { NzMessageService } from '../../../components/message/nz-message.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-draft-calibrate',
  templateUrl: './draft-calibrate.component.html',
  styleUrls: ['./draft-calibrate.component.scss'],
  providers: [SealService, RestClient, NzMessageService]
})
export class DraftCalibrateComponent implements OnInit {
  @ViewChild('docDiv') docDiv: ElementRef;
  private docHeight: number;
  private caseData: any;
  private isSign: boolean;
  private isSeal: boolean;
  private content: any;
  private doc: any = {
    docId: '',
    content: '',
    source: ''
  };
  private left: string;
  private right: string;
  private checkCode = '';
  private caseType = '';
  private type = '';
  private notary: String;
  constructor(
    private seal: SealService,
    private restClient: RestClient,
    private sanitizer: DomSanitizer,
    private router: Router,
    private _message: NzMessageService
  ) { }

  ngOnInit() {
    this.docHeight = document.body.clientHeight - 60 - 42 - 40;
    window.addEventListener('resize', () => {
      this.docHeight = document.body.clientHeight - 60 - 42 - 40;
    })
    this.isSign = this.seal.getSign();
    this.isSeal = this.seal.getSeal();
    const caseId = window.localStorage.getItem('caseId');
    const params = { caseId: caseId, typeId: '213e348b28294558bcc53e45aab6a6d5' };
    this.restClient.request('npm.DocumnetService', 'collection', 'loadDoc', params).then(res => {
      if (res.code === 1) {
        this.doc.docId = res.result.id;
        this.doc.content = res.result.properties.content;
        this.content = this.sanitizer.bypassSecurityTrustHtml(res.result.properties.content);
        this.doc.source = res.result.properties.source;
      }
    });
    this.restClient.request('dm.Entity', caseId, 'retrieve', { typeId: environment.case_type_id }).then(result => {
      if (result) {
        this.caseData = result;
        this.checkCode = this.caseData.properties.checkCode;
        this.caseType = this.caseData.$displays.caseType;
        this.type = this.caseData.$displays.type;
        this.notary = this.caseData.$displays.notary;
      }
    });

  }
  saveDoc(showMsg) {
    const docHtml = this.docDiv.nativeElement.innerHTML;
    const params = {
      docId: this.doc.docId,
      content: docHtml
    }
    this.restClient.request('npm.DocumnetService', 'collection', 'updateDocument', params).then(res => {
      if (res.code === 1) {
        this.doc.docId = res.result.id;
        this.content = this.sanitizer.bypassSecurityTrustHtml(res.result.properties.content);
        if (showMsg) {
          this._message.success('保存成功！');
        }
      } else {
        if (showMsg) {
          this._message.error(res.description);
        }
      }
    });
  }
  calibrate () {
    this.saveDoc(false);
    const caseId = window.localStorage.getItem('caseId');
    const rest = this.restClient.request('dm.DataService', 'nbm.Case@updateStatusToCalibrated', 'invoke', { entityId: caseId });
    rest.then(result => {
      if (result.code === 1) {
        this._message.success('保存成功！');
        this.router.navigateByUrl('/business/nbm.Case@ng-query-in-approved');
      } else {
        this._message.error('保存失败！');
      }
    });
  }
  private print() {
    window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify([this.doc.docId]) +
    '&typeId=213e348b28294558bcc53e45aab6a6d5', '_blank');
  }
}
