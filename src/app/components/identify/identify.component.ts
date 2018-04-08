import { Component, OnInit, DoCheck, ViewChild } from '@angular/core';
import { ProjectService } from '../../service/project.service';
import { PhotographComponent } from '../../components/photograph/photograph.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MachineService } from './../../service/machine.service';
import { NzMessageService } from '../message/nz-message.service';
import { RestClient } from '../../service/rest-client.service';
import { environment } from '../../../environments/environment';
import { MetaLoader } from '../../service/meta-loader.service';
import { View } from 'app/model/view';
import { Type } from 'app/model/type';
import { Business } from 'app/model/business';
import { Entity } from 'app/model/entity';
import { Router } from '@angular/router';
@Component({
  selector: 'app-identify',
  templateUrl: './identify.component.html',
  styleUrls: ['./identify.component.scss'],
  providers: [MachineService, NzMessageService, RestClient]
})

export class IdentifyComponent implements OnInit, DoCheck {
  @ViewChild('identModal') identModal: ModalDirective;
  @ViewChild('fingerModal') fingerModal: ModalDirective;
  @ViewChild('leaveModal') leaveModal: ModalDirective;
  @ViewChild('uploadModal') uploadModal: ModalDirective;
  private isAction: boolean;
  private isDown: boolean;
  private identValue: number;
  private cirValue: number;
  private identList;
  private reset: boolean;
  private helpLink;
  private currentIndex: number;
  private identType: String;
  private highshotId;
  private showHighShotDevice;
  public entity: Entity;
  public entityId: String;

  @ViewChild(PhotographComponent)
  private photograph: PhotographComponent;

  constructor(
    private _project: ProjectService,
    private _message: NzMessageService,
    private machineService: MachineService,
    private restClient: RestClient,
    private router: Router
  ) { }

  ngOnInit() {
    this.highshotId = new Date().getTime();
    this.showHighShotDevice = 'USB CAM2';
    this.helpLink = environment.serverUrl;
    this.identList = [];
    this.isAction = false;
    this.isDown = false;
    this.identValue = 18;
    this.reset = false;
  }

  ngDoCheck() {
    this.identList = this._project.getProject().litigantOfProxy;
  }

  private action (): void {
    this.isAction = true;
    const timer = setTimeout(() => {
      this.isAction = false;
      this.isDown = true;
      clearTimeout(timer);
    }, 2000)
  }

  private resetBtn(i): void {
    this.identList[i].isLoading = false;
    this.identList[i].hasInfoData = false;
    this.identList[i].isFingerLoading = false;
    this.identList[i].hasFingerData = false;
    this.identList[i].status = 'Doing';
    this.identList[i].percent = 0;
  }

  private selectedItem(i): void {
    this.currentIndex = i;
    const party = this.identList[this.currentIndex]
    const caseId = window.localStorage.getItem('caseId');
    this.machineService.redirect('ident', null, {caseId: caseId, partyId: party.ref, type: this.identType});
  }

  private openPhoto (i): void {
    this.currentIndex = i;
    const party = this.identList[this.currentIndex]
    const caseId = window.localStorage.getItem('caseId');
    this.machineService.redirect('ident', null, {caseId: caseId, partyId: party.ref, type: this.identType});
  }

  private submit (): void {
    const caseId = window.localStorage.getItem('caseId');
    const taskId = window.localStorage.getItem('taskId') || '';
    const persons = this.identList;
    const json = {taskId, caseId, persons};

    this._project.submitIdent(json);
    const me = this;
    /* setTimeout(() => {
      const party = me.identList[me.currentIndex]
      me.machineService.redirect('ident', null, {caseId: caseId, partyId: party.ref});
    }, 500); */
    setTimeout(() => {
      me.machineService.redirect('project', caseId, null);
    }, 1000);
    this.clearIdent();
  }

  private fingerModalHide (): void {
    this.leaveModal.show();
  }

  private identModalHide (): void {
    this.leaveModal.show();
  }

  private identModalShow (): void {
    this.identModal.show();
    this.identModal.config = {
      keyboard: false,
      backdrop: 'static'
    }
    this.identType = 'Face';
  }

  private fingerModalShow (): void {
    this.fingerModal.show();
    this.fingerModal.config = {
      keyboard: false,
      backdrop: 'static'
    }
    this.identType = 'Fingerprint';
  }

  private uploadModalShow(item): void {
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.StuffService', 'collection', 'addStuff', {caseId: caseId}).then(res => {
      if (res.code === 1) {
        this._project.getProject().materials.push(res.result);
        this.router.navigateByUrl('/project/home/data');
      }
    })
    // window.localStorage.setItem('identify', JSON.stringify(item));
    // this.uploadModal.show();
  }

  private clearIdent (): void {
    this._project.getProject().litigantOfProxy.map(v => {
      if (!v.hasInfoData) {
        v.isLoading = false;
        v.isFingerLoading = false;
      }
    })
  }

  private checkIdent (): void {
    if (this.identType === 'Fingerprint') {
      this.identType = 'Face';
    } else {
      this.identType = 'Fingerprint';
    }
    this.clearIdent();
    const caseId = window.localStorage.getItem('caseId');
    this._project.getProject().litigantOfProxy = [];
    this.restClient.request('npm.PartyService', 'collection', 'loadParty', {caseId}).then(res => {
      if (res.code === 1) {
        res.result.map(v => {
          this._project.getProject().litigantOfProxy.push(v)
          if (v.proxy) {
            this._project.getProject().litigantOfProxy.push(v.proxy)
          }
        })
      }
    })
  }

  private leave (): void {
    this.clearIdent();
    this.leaveModal.hide();
    this.fingerModal.hide();
    this.identModal.hide();
    const caseId = window.localStorage.getItem('caseId');
    this._project.getProject().litigantOfProxy = [];
    this.restClient.request('npm.PartyService', 'collection', 'loadParty', {caseId}).then(res => {
      if (res.code === 1) {
        res.result.map(v => {
          this._project.getProject().litigantOfProxy.push(v)
          if (v.proxy) {
            this._project.getProject().litigantOfProxy.push(v.proxy)
          }
        })
      }
    })
  }

  private compareFace() {
    const party = this.identList[this.currentIndex]
    const caseId = window.localStorage.getItem('caseId');
    this.machineService.redirect('ident', null, {caseId: caseId, partyId: party.ref, type: this.identType});
    this.identList[this.currentIndex].isLoading = true;
    this.identList[this.currentIndex].hasInfoData = false;
    const me = this;
    this.machineService.frontCompareFace().then(({result, data, error}) => {
      if (result !== 'Fail') {
        me.identList = me._project.getProject().litigantOfProxy = me.identOfData(data)
        const taskId = window.localStorage.getItem('taskId') || '';
        const persons = me.identList;
        const json = {taskId, caseId, persons};
        this._project.submitIdent(json);
        setTimeout(() => {
          me.machineService.redirect('ident', null, {caseId: caseId, partyId: party.ref});
        }, 500);
      } else {
        this.identList[this.currentIndex].isLoading = false;
        this.clearIdent();
        this._message.error(error.message);
      }
    }).catch(error => {
      this.identList[this.currentIndex].isLoading = false;
      this.clearIdent();
    });
  }

  private compareFinger () {
    const party = this.identList[this.currentIndex]
    const caseId = window.localStorage.getItem('caseId');
    this.machineService.redirect('ident', null, {caseId: caseId, partyId: party.ref, type: this.identType});
    this.identList[this.currentIndex].isFingerLoading = true;
    this.identList[this.currentIndex].hasFingerData = false;
    const me = this;
    this.machineService.frontCompareFinger().then(({result, data, error}) => {
      if (result !== 'Fail') {
        this.identList = me._project.getProject().litigantOfProxy = this.fingerOfData(data)
        const taskId = window.localStorage.getItem('taskId') || '';
        const persons = me.identList;
        const json = {taskId, caseId, persons};
        this._project.submitIdent(json);
        setTimeout(() => {
          me.machineService.redirect('ident', null, {caseId: caseId, partyId: party.ref});
        }, 500);
      } else {
        this.identList[this.currentIndex].isFingerLoading = false;
        this.clearIdent();
        this._message.error(error.message);
      }
    }).catch(error => {
      this.identList[this.currentIndex].isFingerLoading = false;
      this.clearIdent();
    });
  }

  private identOfData (data) {
    const percent = data.simDegree
    return [
      ...this.identList.slice(0, this.currentIndex),
      Object.assign({}, this.identList[this.currentIndex], {
        type: 'Face',
        isLoading: false,
        hasInfoData: true,
        status:  data.simDegree > 70 ? 'Success' : 'Failed',
        percent: percent,
        verificationDate: this.getDate(),
        realPic: 'data:image/jpg;base64,' + data.photoCompared,
        // photo: 'data:image/jpg;base64,' + data.photoOrgin
      }),
      ...this.identList.slice(this.currentIndex + 1)
    ];
  }

  private fingerOfData (data) {
    return [
      ...this.identList.slice(0, this.currentIndex),
      Object.assign({}, this.identList[this.currentIndex], {
        type: 'Fingerprint',
        isFingerLoading: false,
        hasFingerData: true,
        status:  data.simDegree > 50 ? 'Success' : 'Failed',
        percent: data.simDegree,
        verificationDate: this.getDate()
      }),
      ...this.identList.slice(this.currentIndex + 1)
    ];
  }

  private report(partyId): void {
    const caseId = window.localStorage.getItem('caseId');
    const p = partyId || '';
    const reportData = JSON.stringify({caseId: caseId, partyId: p});
    window.localStorage.setItem('report', reportData);
    window.open(environment.ctxpath + '/print/print-report.jsp?caseId=' + caseId + '&partyId' + p, '_blank');
  }

  private getDate (): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const second = date.getSeconds();
    return `${year}年${month}月${day}日 ${hours}:${minutes}:${second}`;
  }
  get view(): View {
    return MetaLoader.loadType('nbm.IdentityVerification').getView('detail').definition;
 }
  get type(): Type {
    return MetaLoader.loadType('nbm.IdentityVerification');
 }

 get business(): Business {
   return MetaLoader.loadBusiness('nbm.IdentityVerification@edit');
 }
}
