import { Component, OnInit } from '@angular/core';
import { SealService } from '../../service/seal.service';
import { DraftService } from '../../service/draft.service';
import { RestClient } from './../../service/rest-client.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NzMessageService } from '../message/nz-message.service';
import { environment } from '../../../environments/environment';
declare var jQuery: any;
@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  providers: [SealService, DraftService, RestClient]
})
export class ConfirmComponent implements OnInit {
  private isSign: boolean;
  private isSeal: boolean;
  private activeLitigant = [];
  private helpLink;
  private content: any;
  private doc: any = {
    docId: '',
    content: '',
    make: {
      makeNote: '',
    }
  };
  private caseData: any;

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
    this.helpLink = environment.serverUrl;
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
  }

  passSeal(): void {
    this.seal.passSeal()
    this.isSeal = this.seal.getSeal();
  }

  makeDoc () {
    jQuery('#cachet').attr('style', 'position: absolute;right: 660px;bottom: 5px;width: 200px;height: 200px;background-size: cover;background-position: center center;background-repeat: no-repeat;background-image: url(' + environment.ctxpath + '/assets/images/cachet.png) !important;');

    const docHtml = jQuery('#edit-aera').html();
    if (!docHtml) {
      return;
    }
    this.doc.content = docHtml;
    this.restClient.request('npm.DocumnetService', 'collection', 'make', {params : JSON.stringify(this.doc)}).then(res => {
      if (res.code === 1) {
        this.doc.docId = res.result.id;
        this.content = this.sanitizer.bypassSecurityTrustHtml(res.result.properties.content);
        this._message.success('制证已完成！');
      } else {
        this._message.error(res.description);
      }
    });
  }
  private print (): void {
    window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify([this.doc.docId]), '_blank');
  }
}
