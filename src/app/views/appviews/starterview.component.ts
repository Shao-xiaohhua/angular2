import { Component, OnDestroy, OnInit, } from '@angular/core';
import { Http, RequestOptions, ResponseContentType, Response } from '@angular/http';
import { ProjectService } from "../../service/project.service";

@Component({
  selector: 'starter',
  templateUrl: 'starter.template.html',
  styleUrls: ['./starter.component.scss'],
  providers: [ProjectService]
})
export class StarterViewComponent implements OnDestroy, OnInit  {
  private copyCount: number;
  private bodyH: number;
  private overviewH: number;
  private insideOverviewH: number;
  private checkTab: string;
  private isBtn: boolean;

  private loading: boolean;

  public nav:any;

  // 申请人 & 关系人
  private dragPerson;
  private persons;
  private personInfo;

  public constructor(
    // 申请人 & 关系人
    private _project: ProjectService
  ) {
    this.nav = document.querySelector('nav.navbar');
  }

  public ngOnInit():any {
    this.isBtn = false;
    this.loading = false;
    this.copyCount = 0;
    this.nav.className += " white-bg";
    this.calcWrapSize();
    window.onresize = () => {
      this.calcWrapSize();
    }
    this.checkTab = 'taskList';

    // 申请人 & 关系人
    this.persons = this._project.getProject().litigantData;
    this.dragPerson = {
      selected: null,
      selectTitle: ['申请人', '关系人'],
      lists: this.persons
    }
  }

  // 获取申请人 & 关系人详细信息
  private getPersonInfo (item): void {
    this.personInfo = item;
  }

  // 删除申请人 & 关系人详细信息
  private deletePersonInfo (g, i: number): void {
    g.splice(i, 1)
  }

  // 删除拖拽申请人 & 关系人
  private removeMovedItem(index: number, list: any[]) {
    list.splice(index, 1);
  }
  private log(text: string) {
    console.log(text);
  }

  // 增加申请人 & 关系人详细信息
  private saveLitigant (): void {
    // this._project.addLitigantData();
  }
  private saveParty (): void {
    // this._project.addPartyData();
  }

  private calcWrapSize (): void {
    this.bodyH = document.body.clientHeight;
    this.overviewH = this.bodyH - 60 - 39;
    this.insideOverviewH = this.overviewH - 70 - 174;
  }

  private addCopyCount (): void {
    this.copyCount++
  }
  private decrCopyCount (): void {
    if (this.copyCount <= 0) {
      return
    }
    this.copyCount--;
  }


  public ngOnDestroy(): void {
    this.nav.classList.remove("white-bg");
  }

  private checkTaskList (): void {
    this.checkTab = 'taskList'
  }

  private checkMatter (): void {
    this.checkTab = 'matter'
  }

  private checkPerpson (): void {
    this.checkTab = 'perpson';
  }

  private checkInfo (): void {
    this.checkTab = 'info'
  }

  private checkCharge (): void {
    this.checkTab = 'charge'
  }

  private isLoading (): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 2000)
  }

  private toggleBtn (): void {
    this.isBtn = false;
  }
}
