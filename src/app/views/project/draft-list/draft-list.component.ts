import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RestClient } from '../../../service/rest-client.service';
import { MetaLoader } from '../../../service/meta-loader.service';
@Component({
  selector: 'app-draft-list',
  templateUrl: './draft-list.component.html',
  styleUrls: ['./draft-list.component.scss']
})
export class DraftListComponent implements OnInit {

  public projectList: Array<any>;
  public totalItems: Number;
  public currentPage = 0;
  public smallnumPages: Number = 0;
  public startNum: Number = 0;
  public limit = 10;

  constructor(
    private restClient: RestClient,
    private router: Router
  ) { }

  ngOnInit() {
    this.projectList = []
    this.restClient.request('dm.DataService', 'nbm.Case@queryInEditedWithParty', 'invoke', { start: 0, limit: 10 }).then(res => {
      this.totalItems = res.total;
      res.items.forEach(v => {
        this.projectList.push(v)
      });
    })
  }
  setValue(item) {
    window.localStorage.setItem('caseId', item.id);
    window.localStorage.setItem('typeId', item.typeId);
    window.localStorage.setItem('CHECKCODE', item.properties.checkCode);
    window.localStorage.setItem('caseTypeId', item.properties.caseType);
    this.router.navigateByUrl('/project/draftdiff');
  }

  public setPage(pageNo: number): void {
    this.currentPage = pageNo;
  }

  public updateList(start, limit) {
    this.restClient.request('dm.DataService', 'nbm.Case@queryInEditedWithParty', 'invoke', { start: start, limit: limit }).then(res => {
      this.projectList.splice(0, 10)
      res.items.forEach(v => {
        this.projectList.push(v)
      });
    })
  }

  public pageChanged(event: any): void {
    const start = this.currentPage * this.limit;
    this.updateList(start, this.limit);
    console.log('Page changed to: ' + event.page);
    console.log('Number items per page: ' + event.itemsPerPage);
  }

}
