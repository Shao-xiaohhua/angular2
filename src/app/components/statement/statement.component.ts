import { Component, OnInit, ViewChild } from '@angular/core';
import { PerfectScrollbarComponent, PerfectScrollbarConfigInterface, PerfectScrollbarDirective } from "ngx-perfect-scrollbar";
import { directiveDef } from '@angular/core/src/view/provider';
import { RestClient } from './../../service/rest-client.service';

declare var jQuery: any;

@Component({
  selector: 'app-statement',
  templateUrl: './statement.component.html',
  styleUrls: ['./statement.component.scss'],
  providers: [RestClient]
})
export class StatementComponent implements OnInit {
  private type: string = 'component';
  private taskTem;
  private tasks;
  private isFullscreen: boolean;
  private index: number = 0;
  private identList;

  @ViewChild(PerfectScrollbarComponent) componentScroll: PerfectScrollbarComponent;

  private selectOptions: any = {
    placeholder: '选择或搜索笔录模板',
    language: 'zh-CN',
    theme: 'inspinia',
    width: '100%',
    data: ['模板一', '模板二', '模板三', '模板四', '模板五'],
  };

  private notes = {
    content: '点击此处录入笔录'
  }

  constructor(
    private restClient: RestClient
  ) { }

  ngOnInit() {
    this.isFullscreen = false;
    this.tasks = [];
    this.taskTem = [];
    this.identList = [];

    this.getTmeplate(0)

    const caseId = window.localStorage.getItem('caseId')
    this.restClient.request('npm.PartyService', 'collection', 'loadParty', {caseId}).then(res => {
      if (res.code === 1) {
        res.result.map(v => {
          this.identList.push(v)
          if (v.proxy) {
            this.identList.push(v.proxy)
          }
        })
      }
    })
  }

  private getTmeplate(count) {
    const caseTypeId = window.localStorage.getItem('caseTypeId')
    this.restClient.request('npm.TalkTempService', 'collection', 'loadTalkTemp', {caseTypeId}).then(res => {
      if (res.code === 1) {
        const talkTempId = res.result[count].id
        this.restClient.request('npm.InterlocutionTempService', 'collection', 'loadInterlocutionTemp', {talkTempId}).then(res => {
          if (res.code === 1) {
            this.taskTem = res.result
          }
        })
      }
    })
  }

  private toggleFS(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  private copyTask(i: number, item): void {
    for (let i = 0; i < this.tasks.length; i++) {
      if (item.question === this.tasks[i].q) {
        return
      }
    }
    this.tasks.push({
      type: 'Question',
      content: this.taskTem[i].question,
      isAdd: false,
      owner: '公证员'
    })
    this.tasks.push({
      type: 'Answer',
      content: this.taskTem[i].answer,
      isAdd: false,
      owner: '申请人 - 张盛磊'
    })
  }

  private scrollY() {
    let ps = document.getElementsByClassName('ps')[1];
    let psContent = document.getElementsByClassName('ps-content')[1];
    let noteDialog = document.getElementsByClassName('note-dialog')
    let currentClientH = 83 * 2;
    let allClientH = psContent.clientHeight + currentClientH;
    if (allClientH > ps.clientHeight) {
      this.index++;
      for (let i = 0; i < noteDialog.length; i++) {
        if (noteDialog[i].clientHeight > currentClientH) {
          currentClientH = noteDialog[i].clientHeight * 2;
          continue;
        }
      }
      this.componentScroll.directiveRef.scrollTo(0, currentClientH*this.index, 500);
    }
  }

  private delTask(i: number): void {
    this.tasks.splice(i, 1)
  }

  private addGreTask(e): void {
    let editBtn = document.getElementsByClassName('edit-btn')
    for (let i = 0; i < editBtn.length; i++) {
      editBtn[i].className = 'btn btn-default edit-btn'
    }
    e.target.className = 'btn btn-info edit-btn'
    this.tasks.push({
      type: 'Question',
      content: '请输入问题',
      isAdd: true,
      owner: '公证员 - 胡晓瑾'
    })
  }

  private addApplyTask(e): void {
    const owner = e.target.innerHTML
    let editBtn = document.getElementsByClassName('edit-btn')
    for (let i = 0; i < editBtn.length; i++) {
      editBtn[i].className = 'btn btn-default edit-btn'
    }
    e.target.className = 'btn btn-info edit-btn'
    this.tasks.push({
      type: 'Answer',
      content: '请输入回答',
      isAdd: true,
      owner
    })
  }

  private editOver(i: number): void {
    this.tasks[i].isAdd = false;
  }

  private editTo(i: number): void {
    this.tasks[i].isAdd = true;
  }
}
