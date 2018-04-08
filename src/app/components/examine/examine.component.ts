import { Component, OnInit } from '@angular/core';
import { SealService } from '../../service/seal.service';
import { DraftService } from '../../service/draft.service';
import { RestClient } from './../../service/rest-client.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NzMessageService } from '../message/nz-message.service';
import { environment } from '../../../environments/environment';
declare var jQuery: any;
@Component({
  selector: 'app-examine',
  templateUrl: './examine.component.html',
  styleUrls: ['./examine.component.scss'],
  providers: [SealService, DraftService, RestClient]
})
export class ExamineComponent implements OnInit {
  private isSign: boolean;
  private isSeal: boolean;
  private activeLitigant = [];
  private content: any;
  private doc: any = {
    docId: '',
    content: '',
    approve: {
      approveNote: '',
    }
  };
  private caseData: any;
  private helpLink;

  constructor(
    private seal: SealService,
    private draftService: DraftService,
    private restClient: RestClient,
    private sanitizer: DomSanitizer,
    private _message: NzMessageService,
  ) { }

  ngOnInit() {
    this.isSign = this.seal.getSign()
    this.isSeal = this.seal.getSeal()
    this.activeLitigant = this.draftService.getActiveLitigant()
    const caseId = window.localStorage.getItem('caseId');
    const params = { caseId: caseId, typeId: '213e348b28294558bcc53e45aab6a6d5' }
    this.restClient.request('npm.DocumnetService', 'collection', 'loadDoc', params).then(res => {
      if (res.code === 1) {
        this.doc.docId = res.result.id;
        this.doc.content = res.result.properties.content;
        this.content = this.sanitizer.bypassSecurityTrustHtml(res.result.properties.content);
      }
    });
    this.restClient.request('dm.Entity', caseId, 'retrieve', { typeId: environment.case_type_id }).then(result => {
      if (result) {
        this.caseData = result;
      }
    });
    this.helpLink = environment.serverUrl;
  }

  passSign(): void {
    this.seal.passSign();
    this.isSign = this.seal.getSign();
  }

  approveDoc (result) {
    if (!result) {
      return;
    }
    if (result === 'Pass') {
      jQuery('#sign').attr('style', 'position: absolute;right: 340px;bottom: 36px;width: 200px;height: 76px;background-size: cover;background-position: center center;background-repeat: no-repeat;background-image: url(' + environment.ctxpath + '/assets/images/sign.png) !important;');
    }
    const docHtml = jQuery('#edit-aera').html();
    if (!docHtml) {
      return;
    }
    this.doc.approve.approveResult = result;
    this.doc.content = docHtml;
    this.restClient.request('npm.DocumnetService', 'collection', 'approve', {params : JSON.stringify(this.doc)}).then(res => {
      if (res.code === 1) {
        this.doc.docId = res.result.id;
        this.content = this.sanitizer.bypassSecurityTrustHtml(res.result.properties.content);
        this._message.success('审批已完成！');
      } else {
        this._message.error(res.description);
      }
    });
  }
}
