import { from } from 'rxjs/observable/from';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SealService } from '../../../service/seal.service';
import { RestClient } from '.././../../service/rest-client.service';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { NzMessageService } from '../../../components/message/nz-message.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-draft-diff',
  templateUrl: './draft-diff.component.html',
  styleUrls: ['./draft-diff.component.scss'],
  providers: [SealService, RestClient, NzMessageService]
})
export class DraftDiffComponent implements OnInit {
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
  private translateLanguage = '';
  private num = '';
  private attestation = '';
  private draftNote: '';
  private approveNote: '';
  constructor(
    private seal: SealService,
    private restClient: RestClient,
    private sanitizer: DomSanitizer,
    private router: Router,
    private _message: NzMessageService
  ) { }

  ngOnInit() {
    // this.left = ['aaaaww', 'bbbbwww', 'cc'].join('\n');
    // this.right = ['aaa', 'wwqerew'].join('\n');
    this.left = 'aaaaaaa';
    this.right = 'aaabbbb';
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
        this.translateLanguage = this.caseData.$displays.translateLanguage;
        this.num = this.caseData.properties.num;
        this.attestation = this.caseData.$displays.attestation;
        this.draftNote = this.caseData.properties.draftNote;
        this.approveNote = this.caseData.properties.approveNote;
      }
    });

  }
  approveDoc (result) {
    if (!result) {
      return;
    }
    const docHtml = this.docDiv.nativeElement.innerHTML;
    if (!docHtml) {
      this._message.error('文书内容不能为空');
      return;
    }
    if (!this.approveNote) {
      this._message.error('审批人意见不能为空');
      return;
    }
    this.doc.content = docHtml;
    const params = {
      approveResult: result,
      approveNote: this.approveNote,
      doc: this.doc
    }
    this.restClient.request('npm.DocumnetService', 'collection', 'approve', params).then(res => {
      if (res.code === 1) {
        this.doc.docId = res.result.id;
        this.content = this.sanitizer.bypassSecurityTrustHtml(res.result.properties.content);
        this._message.success('保存成功！');
        if (result === 'Pass') {
          this.printApprovalList();
          this.router.navigateByUrl('/project/darftlist');
        }
      } else {
        this._message.error(res.description);
      }
    });
  }
  private printApprovalList() {
    const caseId = window.localStorage.getItem('caseId');
    window.open(environment.serverUrl + '/print/print-approval.jsp?caseId=' + caseId, '_blank');
  }
  private showPandect() {
    this.router.navigateByUrl('/project/pandect');
  }
  private print() {
    window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify([this.doc.docId]) +
    '&typeId=213e348b28294558bcc53e45aab6a6d5', '_blank');
  }
}
