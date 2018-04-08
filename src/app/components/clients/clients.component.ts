import { Component, OnInit, DoCheck } from '@angular/core';
import { ProjectService } from '../../service/project.service';
import { RestClient } from './../../service/rest-client.service';
import { NzMessageService } from '../message/nz-message.service';
@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  providers: [ProjectService, RestClient]
})

export class ClientsComponent implements OnInit, DoCheck {
  // 申请人 & 关系人
  private dragPerson;
  private persons;
  private personInfo;
  private addCount: number;

  constructor(
    private _project: ProjectService,
    private restClient: RestClient,
    private _message: NzMessageService
  ) { }

  ngOnInit() {
    // 申请人 & 关系人
    this.persons = [[], []];
  }

  ngDoCheck () {
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
    const item = g[i];
    if (window.confirm('确认删除' + item.name + '的信息？')) {
      if (item.ref) {
        this.restClient.request('npm.PartyService', 'collection', 'deleteParty', { partyId: item.ref }).then(res => {
          if (res.code && res.code === 1) {
            this._message.success('删除成功！');
          } else {
            this._message.error(res.description);
          }
        });
      }
      g.splice(i, 1);
    }
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

  addLitigant (i): void {
    this.addCount = i;
  }

}
