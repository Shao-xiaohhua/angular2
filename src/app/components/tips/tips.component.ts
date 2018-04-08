import { Component, OnInit, OnDestroy } from '@angular/core';
import { RestClient } from './../../service/rest-client.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtml } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { ProjectService } from '../../service/project.service';
import { environment } from '../../../environments/environment';
import { NzMessageService } from '../message/nz-message.service';
import { MachineService } from './../../service/machine.service';
@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss'],
  providers: [RestClient, ProjectService, MachineService]
})
export class TipsComponent implements OnInit, OnDestroy {
  private noteContent: SafeHtml;
  private noteId: String;
  private helpLink;
  private isDone;
  private status;
  private interval: any;
  private signConfig: any;
  private currenConfig: any;
  private isChange = false;
  private entityConfig: any;

  constructor(
    private restClient: RestClient,
    private sanitizer: DomSanitizer,
    private _project: ProjectService,
    private machineService: MachineService,
    private _message: NzMessageService
  ) { }

  ngOnInit() {
    this.helpLink = environment.serverUrl;
    this.signConfig = {};
    this.currenConfig = {};
    this.entityConfig = {};
    this.currenConfig.buttonName = '公证受理告知书';
    this.currenConfig.mothed = 'createAcceptInformedDocument';
    const caseId = window.localStorage.getItem('caseId');
    const r = this.restClient.request('npm.RiskInformedService', 'collection', 'loadRiskInformed', {caseId});
    r.then(res => {
      if (res.code === 1) {
        this.entityConfig.id = res.result.id;
        this.entityConfig.typeId = res.result.typeId;
        this.noteContent = this.sanitizer.bypassSecurityTrustHtml(res.result.properties.content)
        this.signConfig['autograph'] = res.result.properties.autograph;
        this.signConfig['autographDate'] = res.result.$displays.autographDate;
        this.noteId = res.result.id;
        this.status = res.result.properties.status;
        if (this.status === 'Completed') {
          this.signConfig['isResetSign'] = false;
        }
      }
    });
    this.isDone = false;
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  private resetSign() {
    this.signConfig['isResetSign'] = true;
    const r = this.restClient.request('npm.RiskInformedService', 'collection', 'updateStatusToSubmitted', {informedId: this.noteId});
    r.then(res => {
        if (res.code === 1) {
          this.status = res.result.properties.status;
          this.signConfig['autograph'] = res.result.properties.autograph;
          this.signConfig['autographDate'] = res.result.$displays.autographDate;
          this.startTip();
        }
      });
  };

  private submitTip () {
    const informedId = this.noteId;
    this.restClient.request('npm.RiskInformedService', 'collection', 'informed', {informedId: informedId})
    .then(res => {
      if (res.code === 1) {
        this.status = res.result.properties.status;
        this._message.success('确认已告知');
        this._project.getTasks();
      }
    })
  }


  private startTip() {
    const caseId = window.localStorage.getItem('caseId');
    this.machineService.redirect('tips', null , this.entityConfig);
    setTimeout(() => {
      this.isDone = true;
    }, 2000);
    this.interval = setInterval(() => {
      this.restClient.request('npm.RiskInformedService', 'collection', 'retrieve', {informedId: this.noteId})
      .then(res => {
        if (res.code === 1) {
          this.entityConfig.id = res.result.id;
          this.entityConfig.typeId = res.result.typeId;
          this.status = res.result.properties.status;
          if (this.status === 'Completed') {
            this.signConfig['autograph'] = res.result.properties.autograph;
            this.signConfig['autographDate'] = res.result.$displays.autographDate;
            this.signConfig['isResetSign'] = false;
            clearInterval(this.interval);
          }
        }
      })
    }, 3000);

  }

  private changeContent(mothed) {
    if (!mothed) {
      return;
    }
    if (mothed === 'createAcceptInformedDocument') {
      this.currenConfig.buttonName = '五不准告知书';
      this.currenConfig.mothed = 'loadRiskInformed';
    } else if (mothed === 'loadRiskInformed') {
      this.currenConfig.buttonName = '公证受理告知书';
      this.currenConfig.mothed = 'createAcceptInformedDocument';
    }
    this.isChange = true;
    const caseId = window.localStorage.getItem('caseId');
    const r = this.restClient.request('npm.RiskInformedService', 'collection', mothed, {caseId});
    r.then(res => {
      if (res.code === 1) {
        this.noteId = res.result.id;
        this.entityConfig.id = res.result.id;
        this.entityConfig.typeId = res.result.typeId;
        this.noteContent = this.sanitizer.bypassSecurityTrustHtml(res.result.properties.content);
        this.isChange = false;
        if (this.isDone) {
          this.machineService.redirect('tips', null , this.entityConfig);
        }
      }
    });
  }
  private print (): void {
    window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify([this.noteId]) +
    '&typeId=bd6014657f8d4c199a87013ab3f35982', '_blank');
  }
}
