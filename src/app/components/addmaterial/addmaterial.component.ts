import { Component, OnInit, DoCheck, ViewChild, EventEmitter } from '@angular/core';
import { PhotographComponent } from '../../components/photograph/photograph.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Material, Page } from '../../model/materials';
import { ProjectService } from '../../service/project.service';
import { NzMessageService } from '../../components/message/nz-message.service';

@Component({
  selector: 'app-addmaterial',
  templateUrl: './addmaterial.component.html',
  styleUrls: ['./addmaterial.component.scss'],
  providers: [ProjectService]
})
export class AddmaterialComponent implements OnInit, DoCheck {
  @ViewChild(ModalDirective) materModal: ModalDirective;
  private materialList;
  private matters;
  private isDisable: boolean;
  private page: number;

  @ViewChild(PhotographComponent)
  private photograph: PhotographComponent;
  private highshotId;
  private showHighShotDevice;
  public readonly = true;
  private currentIndex: number;
  private index: number;
  deleteRequest = new EventEmitter<Page>();

  constructor(
    private _project: ProjectService,
    private _message: NzMessageService
  ) { }

  ngOnInit() {
    this.currentIndex = 0;
    this.highshotId = new Date().getTime();
    this.showHighShotDevice = 'T882';
    // 材料
    this.materialList = [];
  }

  ngDoCheck () {
    this.materialList = this._project.getProject().materials;
  }

  public captureImage (data) {
    if (data) {
    }
  }

  editName(j, i) {
    // let input: any = document.getElementsByClassName('edit-inp');
    this._project.getProject().materials[i].pages[j].readonly = false;
    // input[j].focus();
  }

  resetPhoto(page) {
    page.pic = ''
  }

  update(page) {
    page.readonly = true;
  }

  // 新增材料页
  addPage(item) {
    const newPage = {
      id: '',
      name: '未命名材料 - ' + item.id + item.pages.length,
      pic: '',
      isCustom: true,
      status: 'wait',
      readonly: true,
      result: {}
    };
    this._project.getProject().materials[this.currentIndex].pages.push(newPage);
  }

  delete(pages) {
    this.deleteRequest.emit(pages);
  }

  deleteMateial (pages, j): void {
    pages.splice(j, 1);
  }

  checkedMaterial (i) {
    this.currentIndex = i;
  }

  private onShown (): void {
    this.photograph.onShown();
    setTimeout( () => {
      // this.photograph.setDeskew();
      this.photograph.AddText();
    }, 6000);
  }
  private onHide (): void {
    this.photograph.onHide();
  }

  private setCurrentPage (i: number): void {
    this.page = i;
  }

  private openPhoto (j: number): void {
    this.index = j;
  }

  private addMaterial (): void {
    const newMaterial = {
      canAdd: true,
      id: '',
      isComplete: false,
      name: '新增材料',
      editGroup: true,
      titleReadonly: false,
      pages: [
        {
          id: '',
          name: '新增材料',
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
    const stuffs = this.materialList;
    const caseId = window.localStorage.getItem('caseId');
    const taskId = window.localStorage.getItem('taskId');
    const json = {taskId, caseId, stuffs};

    if (json.taskId && json.caseId && json.stuffs) {
      // this._project.submitMaterial(json);
    } else {
      this._message.error('请拍照')
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
    this.materialList.splice(this.currentIndex, 1);
    this.currentIndex = 0;
  }
}
