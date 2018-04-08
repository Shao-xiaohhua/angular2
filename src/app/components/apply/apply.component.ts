import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { RestClient } from './../../service/rest-client.service';
import { MetaLoader } from 'app/service/meta-loader.service';
import { Category } from 'app/model/category';
import { environment } from '../../../environments/environment';
import { NzMessageService } from '../message/nz-message.service';
import { Router } from '@angular/router';
declare var jQuery: any;

@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html',
  styleUrls: ['./apply.component.scss'],
  providers: [RestClient]
})
export class ApplyComponent implements OnInit {
  private view: string;
  private taskList;
  private acceptNote: String;
  private accepter: String;
  private acceptDate: String;
  private caseData;
  private status: String;
  private disabled = false;
  private success = false;
  @ViewChild('notPassDoc') notPassDoc: ElementRef;
  constructor(
    private restClient: RestClient,
    private router: Router,
    private _message: NzMessageService
  ) { }

  ngOnInit() {
    const _view: string | null = window.localStorage.getItem('apply-view');
    if (_view) {
      this.view = _view;
    } else {
      this.view = 'home';
    }
    this.taskList = null;
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.StaticTaskService', 'collection', 'loadTask', {caseId}).then(res => {
      if (res.code === 1) {
        const {result} = res;
        this.taskList = result[0];
        for (let i = 0; i < this.taskList.items.length; i ++) {
          const item = this.taskList.items[i];
          if (item.status !== 'Success') {
            this.disabled = true;
            break;
          }
        }
      }
    })
    const rest = this.restClient.request('dm.Entity', caseId, 'retrieve', { typeId: environment.case_type_id });
    rest.then(result => {
      this.caseData = result;
      this.status = this.caseData.properties.status;
      this.acceptNote = this.caseData.properties.acceptNote;
      this.accepter = this.caseData.$displays.accepter;
      this.acceptDate = this.caseData.$displays.acceptDate;
      if (this.status && this.status === 'Refused') {
        this.goto('note');
      }
      if (this.accepter) {
        this.disabled = true;
      }
    });
  }

  private goto (path: string): void {
    window.localStorage.setItem('apply-view', path);
    this.view = path;
  }

  applyNotPass() {
    const caseId = window.localStorage.getItem('caseId');
    const parmas = {};
    parmas['caseId'] = caseId;
    parmas['acceptNote'] = this.acceptNote;
    this.restClient.request('inm.CaseService', 'collection', 'applyNotPass', parmas).then(r => {
      if (r.code === 1) {
        this.success = true;
        this.caseData = r.result.caseData;
        this.acceptNote = this.caseData.properties.acceptNote;
        this.accepter = this.caseData.$displays.accepter;
        this.acceptDate = this.caseData.$displays.acceptDate;
        this.goto('result');
      } else {
        this.success = false;
        this.goto('result');
      }
    });
  }

  applyPass() {
    const caseId = window.localStorage.getItem('caseId');
    const parmas = {};
    parmas['caseId'] = caseId;
    this.disabled = true;
    this.restClient.request('inm.CaseService', 'collection', 'applyPass', parmas).then(r => {
      if (r.code === 1) {
        this.caseData = r.result;
        this._message.success('受理完成！');
        this.router.navigateByUrl('/project/home/costs');
      } else {
        this._message.error(r.description);
        this.disabled = false;
      }
    });
  }

  addStuff() {
    this.router.navigateByUrl('/project/home/data');
  }

}
