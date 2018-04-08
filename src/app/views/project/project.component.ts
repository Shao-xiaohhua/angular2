import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RestClient } from '../../service/rest-client.service';
import { MachineService } from '../../service/machine.service';
import { MetaLoader } from '../../service/meta-loader.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.template.html',
  styleUrls: ['./project.component.scss'],
  providers: [MachineService]
})

export class ProjectComponent implements OnInit {

  public projectList: Array<any>;
  public totalItems: Number;
  public currentPage = 0;
  public smallnumPages: Number = 0;
  public startNum: Number = 0;
  public limit = 10;

  constructor(private restClient: RestClient,
    private machineService: MachineService,
    private router: Router) { }

  ngOnInit() {
    this.projectList = []
    this.restClient.request('dm.DataService', 'nbm.Case@queryWithParty', 'invoke', { start: 0, limit: 10 }).then(res => {
      this.totalItems = res.total;
      res.items.forEach(v => {
        this.projectList.push(v)
      });
    })
    this.machineService.redirect('badge', MetaLoader.CURRENT_USER.personId, null);
  }

  setValue(item) {
    window.localStorage.setItem('caseId', item.id);
    window.localStorage.setItem('typeId', item.typeId);
    window.localStorage.setItem('CHECKCODE', item.properties.checkCode);
    window.localStorage.setItem('caseTypeId', item.properties.caseType);
    this.router.navigateByUrl('/project/home/settings');
  }

  public setPage(pageNo: number): void {
    this.currentPage = pageNo;
  }

  public updateList(start, limit) {
    this.restClient.request('dm.DataService', 'nbm.Case@queryWithParty', 'invoke', { start: start, limit: limit }).then(res => {
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

  public addProject(): void {
    this.stopVideoRecord();
    this.startVideoRecord();
    this.router.navigateByUrl('/project/create');
  }
  stopVideoRecord(): void {
    const sessionId = window.localStorage.getItem('__sessionId__');
    if (sessionId) {
      this.machineService.videoRecord(sessionId, 'Stop').then(res => {
        if (res.result === 'Success') {
          console.log('video stop', res);
        }
      });
    }
  }

  startVideoRecord (): void {
    if (MetaLoader.DEVICE_KEY) {
      const sessionId = new Date().getTime() + '';
      window.localStorage.setItem('__sessionId__', sessionId);
      this.machineService.videoRecord(sessionId, 'Start').then(res => {
        if (res.result === 'Success') {
          console.log('video start', res);
        }
      });
    }
  }
}
