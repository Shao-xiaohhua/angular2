import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MetaLoader } from 'app/service/meta-loader.service';
import { Category } from 'app/model/category';
import { RestClient } from './../../service/rest-client.service';
import { environment } from '../../../environments/environment';
import { NzMessageService } from '../message/nz-message.service';
import { Router } from '@angular/router';
declare var jQuery: any;

@Component({
  selector: 'app-stop',
  templateUrl: './stop.component.html',
  styleUrls: ['./stop.component.scss']
})
export class StopComponent implements OnInit {
  private stopProcessView: string;
  private categoryList;
  private selectList = [];
  private checkNote: String;
  private caseData;
  private currentDate = new Date();
  private partyName: String;
  private docId: String;
  private status: String;
  private disabled = false;
  private checkDate: String;
  private checker: String;
  @ViewChild('notPassDoc') notPassDoc: ElementRef;
  @ViewChild('stopDoc') stopDoc: ElementRef;
  private stopNote: String;
  private stoper: String;
  private stopDate: String;
  constructor(
    private restClient: RestClient,
    private _message: NzMessageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.selectList = [];
    this.stopProcessView = 'stop-form';
    const _view: string | null = window.localStorage.getItem('stopProcessView');
    if (_view) {
      this.stopProcessView = _view;
    } else {
      this.stopProcessView = 'stop-form';
    }
    const category: Category = MetaLoader.loadCategorySet('c3793b398bc046818292970264baa44f');
    if (category) {
      this.categoryList = category.children;
    }
    const caseId = window.localStorage.getItem('caseId');
    const rest = this.restClient.request('dm.Entity', caseId, 'retrieve', { typeId: environment.case_type_id });
    rest.then(result => {
      this.caseData = result;
      this.status = this.caseData.properties.status;
      if (this.status && this.status === 'StopApplying') {
        this.goto('stop-result');
      }
    });
    this.restClient.request('npm.PartyService', 'collection', 'loadPartyNames', { caseId: caseId }).then(result => {
      this.partyName = result.description;
    });
  }

  private goto (path: string): void {
    if (path === 'stop-note') {
      if (!this.selectList || this.selectList.length <= 0) {
        this._message.error('请填写原因！');
        return;
      } else if (!this.stopNote) {
        this._message.error('请填写备注！');
        return;
      }
    }
    window.localStorage.setItem('stopProcessView', path);
    this.stopProcessView = path;
  }

  isHave(list, value) {
    let isHave = false;
    for (let i = 0; i < this.selectList.length; i ++) {
      const item = this.selectList[i];
      if (item && value && item === value) {
        isHave = true;
        break;
      }
    }
    return isHave;
  }
  setCategory(category) {
    if (category) {
      const categoryId = category.id;
      if (this.isHave(this.selectList, categoryId)) {
        this.selectList.splice(jQuery.inArray(categoryId, this.selectList), 1);
      } else {
        this.selectList.push(categoryId);
      }
    }
  }

  saveNote() {
    const caseId = window.localStorage.getItem('caseId');
    const parmas = {};
    parmas['caseId'] = caseId;
    parmas['notExcuteCause'] = this.selectList;
    parmas['checkNote'] = this.checkNote;
    parmas['notPassDoc'] = this.notPassDoc.nativeElement.innerHTML;
    this.restClient.request('inm.CaseService', 'collection', 'checNotPass', parmas).then(r => {
      if (r.code === 1) {
        this.docId = r.result.docId;
        this.caseData = r.result.caseData;
        this.checkDate = this.caseData.$displays.checkDate;
        this.checker = this.caseData.$displays.checker;
        this.goto('result');
      } else {
        this.goto('result');
      }
    });
  }

  stopApply() {
    const caseId = window.localStorage.getItem('caseId');
    const parmas = {};
    parmas['caseId'] = caseId;
    parmas['stopCause'] = this.selectList;
    parmas['stopNote'] = this.stopNote;
    parmas['stopDoc'] = this.stopDoc.nativeElement.innerHTML;
    this.restClient.request('inm.CaseService', 'collection', 'stopApply', parmas).then(r => {
      if (r.code === 1) {
        this.docId = r.result.docId;
        this.caseData = r.result.caseData;
        this.stopDate = this.caseData.$displays.stopDate;
        this.stoper = this.caseData.$displays.stoper;
        this.goto('stop-result');
      } else {
        this.goto('stop-result');
      }
    });
  }

}
