import { Component, OnInit, DoCheck, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { PhotographComponent } from '../../components/photograph/photograph.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Material, Page } from '../../model/materials';
import { ProjectService } from '../../service/project.service';
import { NzMessageService } from '../../components/message/nz-message.service';
import { RestClient } from '../../service/rest-client.service';
import { environment } from '../../../environments/environment';
import { SwiperService } from '../../service/swiper.service'
import { MachineService } from './../../service/machine.service';
@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
  providers: [ProjectService, RestClient, SwiperService, MachineService]
})

export class DataComponent implements OnInit, DoCheck {
  @ViewChild('materModal') materModal: ModalDirective;
  @ViewChild('leaveModal') leaveModal: ModalDirective;
  @ViewChild('changeInpModal') changeInpModal: ElementRef;
  private materialList;
  private matters;
  private isDisable: boolean;
  private page: number;
  private allMaterial: number;
  private currentPhoto: number;
  private modalInpName: string;

  @ViewChild(PhotographComponent)
  private photograph: PhotographComponent;
  private highshotId;
  private showHighShotDevice;
  public readonly = true;
  private currentIndex: number;
  private index: number;
  private helpLink;
  private currentStuff: any;
  deleteRequest = new EventEmitter<Page>();

  constructor(
    private _project: ProjectService,
    private _message: NzMessageService,
    private restClient: RestClient,
    private machineService: MachineService,
    private _swiper: SwiperService
  ) { }

  ngOnInit() {
    this.currentPhoto = 0;
    this.allMaterial = 0;
    this.currentIndex = 0;
    this.index = 0;
    this.highshotId = new Date().getTime();
    this.showHighShotDevice = 'T882';
    // 材料
    this.materialList = [];
    this.helpLink = environment.serverUrl;
    this.currentStuff = this._project.getProject().materials[0];
  }

  ngDoCheck () {
    this.materialList = this._project.getProject().materials;
  }

  public captureImage (data) {
    this.calcCurrentAllMaterial();
    setTimeout(() => {
      this.submit();
    }, 1000);
  }
  hiddenModal () {
    this.materModal.hide();
  }
  shownModal () {
    this.materModal.show();
  }
  editName(j, i) {
    // let input: any = document.getElementsByClassName('edit-inp');
    this._project.getProject().materials[i].pages[j].readonly = false;
    // input[j].focus();
  }

  resetPhoto(page, i: number, j: number) {
    page.pic = ''
    this.materialList[i].pages[j].pic = '';
    this._project.getProject().materials[i].pages[j].pic = '';
    this.calcCurrentAllMaterial();
  }

  update(page) {
    page.readonly = true;
  }

  // 新增材料页
  addPage(item) {
    const newPage = {
      id: '',
      name: '新建材料',
      picURL: '',
      isCustom: true,
      status: 'wait',
      readonly: true,
      result: {}
    };
    this._project.getProject().materials[this.currentIndex].pages.push(newPage);
    this.calcCurrentAllMaterial();
  }

  delete(pages) {
    this.deleteRequest.emit(pages);
  }

  deleteMateial (pages, j): void {
    this._project.removeMaterial(pages[j].id);
    pages.splice(j, 1);
    this.calcCurrentAllMaterial();
  }

  checkedMaterial (i) {
    this.currentIndex = i;
    this.currentStuff = this.materialList[i];
    this._swiper.initIndex(0);
  }

  private onShown (): void {
    const o = this.materialList[this.currentIndex];
    this.photograph.setDeskew(o.isDeskew);
    this.photograph.onShown();
  }

  private onHide (): void {
    this.photograph.onHide();
    setTimeout(() => {
      const caseId = window.localStorage.getItem('caseId');
      this.machineService.redirect('project', caseId, null);
    }, 2000);
  }

  private setCurrentPage (i: number): void {
    this.page = i;
  }

  private openPhoto (page, j: number): void {
    this.materModal.config = {
      keyboard: false,
      backdrop: 'static'
    };
    this._swiper.initIndex(j);
    this.index = j;
    this._project.getProject().materialPageHasPic = [];
    this.materialList[this.currentIndex].pages.map(v => {
        this._project.getProject().materialPageHasPic.push(v);
    })
    this.redirctMaterialClient();
  }

  private addMaterial (): void {
    setTimeout(() => {
      this.changeInpModal.nativeElement.value = '';
    })
    const newMaterial = {
      canAdd: true,
      id: '',
      isComplete: false,
      name: '新增材料',
      isNewAdd: true,
      editGroup: true,
      titleReadonly: false,
      pages: [
        {
          id: '',
          name: '新增材料',
          picURL: '',
          pic: '',
          isCustom: true,
          status: 'wait',
          readonly: true,
          result: {}
        }
      ]
    };
    this.currentIndex = this.materialList.length;
    this.materialList.push(newMaterial);
  }

  private submit (): void {
    const caseId = window.localStorage.getItem('caseId');
    const taskId = window.localStorage.getItem('taskId') || '';

    const stuffs = this.materialList;

    const json = {taskId, caseId, stuffs};

    this.calcCurrentAllMaterial();

    if (json.caseId && json.stuffs.length) {
      this._project.submitMaterial(json, () => {
        this.calcCurrentAllMaterial();
        this.redirctMaterialClient();
      });
    } else {
      this._message.error('请拍照')
    }
  }

  private changeGroupName (e): void {
    this.modalInpName = e.target.value
  }

  private replaceGroupName (): void {
    if (!this.modalInpName) {
      this.materialList[this.currentIndex].name = '新增材料'
    } else {
      this.materialList[this.currentIndex].name = this.modalInpName
    }
  }

  private editGroup (): void {
    const materialTitle: any = document.querySelector('.material-title');
    materialTitle.setAttribute('contenteditable', 'true');
    materialTitle.focus();
    this.materialList[this.currentIndex].editGroup = false;
    this.materialList[this.currentIndex].titleReadonly = true;
  }

  private cancelGroup (): void {
    const materialTitle: any = document.querySelector('.material-title');
    const materialTitleText: any = document.querySelector('.material-title-text');
    materialTitle.removeAttribute('contenteditable');
    this.materialList[this.currentIndex].editGroup = true;
    this.materialList[this.currentIndex].titleReadonly = false;
    this.materialList[this.currentIndex].name = materialTitleText.innerHTML;
  }

  private removeGroup (): void {
    this._project.removeMaterials(this._project.getProject().materials[this.currentIndex].id);
    this.materialList.splice(this.currentIndex, 1);
    this.currentIndex = 0;
  }

  private leave (): void {
    this.leaveModal.hide();
    this.materModal.hide();
    this.calcCurrentAllMaterial();
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.StuffService', 'collection', 'loadStuff', {caseId}).then(res => {
      if (res.code === 1) {
        this._project.getProject().materials = res.result;
        this.calcCurrentAllMaterial();
      }
    })
  }

  private calcCurrentAllMaterial () {
    this.allMaterial = 0;
    this.materialList[this.currentIndex].pages.map(v => {
      if (v.pic) {
        this.allMaterial++;
      }
    })
    this.materialList[this.currentIndex].realNum = this.allMaterial;
    this._project.getProject().materials[this.currentIndex].realNum = this.allMaterial;
  }

  public prev(data) {
    const caseId = window.localStorage.getItem('caseId');
    this.machineService.redirect('stuff', null, {caseId: caseId, stuffFileId: data.id});
  }

  public next(data) {
    const caseId = window.localStorage.getItem('caseId');
    this.machineService.redirect('stuff', null, {caseId: caseId, stuffFileId: data.id});
  }

  private redirctMaterialClient() {
    const material = this.materialList[this.currentIndex];
    if (material && material.pages.length > 0) {
      const i = material.pages.length < this.index ? material.pages.length : this.index;
      const page = material.pages[i];
      const caseId = window.localStorage.getItem('caseId');
      this.machineService.redirect('stuff', null, {caseId: caseId, stuffFileId: page.id});
    }
  }

  private printReciveDoc() {
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.StuffFileService', 'collection', 'createReciveDocument', {caseId: caseId}).then(res => {
      if (res.code === 1) {
        window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify([res.result.id]), '_blank');
      }
    });
  }

  private printCorrectionDoc() {
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.StuffFileService', 'collection', 'createCorrectionDocument', {caseId: caseId}).then(res => {
      if (res.code === 1) {
        window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify([res.result.id]), '_blank');
      }
    });
  }
  private printStuff() {
    window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify([this.currentStuff.id]) + '&typeId=' +
    this.currentStuff.typeId, '_blank');
  }

  private printAllStuff() {
    const stuffIds = [];
    this.materialList.forEach(element => {
      stuffIds.push(element.id);
    });
    window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify(stuffIds) + '&typeId=' +
    this.currentStuff.typeId, '_blank');
  }
}
