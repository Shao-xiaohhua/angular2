import { Component, OnInit, DoCheck, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../service/project.service';
import { environment } from '../../../environments/environment';
import { RestClient } from './../../service/rest-client.service';

declare var jQuery: any;

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})

export class OverviewComponent implements OnInit, DoCheck, OnDestroy {
  public projectInfo;
  public caseNumber;
  public checkCode;
  public clientList: Array<any>;
  public showNumber: Number;
  private isAddClient: boolean;
  private hasDataInfo: boolean;
  private barCode;
  private todo;

  public caseType: String;
  public projectTimer;
  constructor(
    private _project: ProjectService,
    private router: Router,
    private restClient: RestClient
  ) { }

  ngOnInit() {
    this.hasDataInfo = false;
    this.showNum()
    this.checkCode = window.localStorage.getItem('CHECKCODE');
    this.clientList = [];
    this.projectInfo = {};
    this.caseNumber = '';
    this.barCode = environment.restServiceUrl + 'npm.CodeImageService/collection/barcode?unicode=' + this.checkCode;
    this._project.getTasks();
    this.todo = this._project.getProject().todo;
    const page = this;
    this.projectTimer = window.setInterval(function(){
      page._project.loadCase();
      page.projectInfo = page._project.getProject().projectInfo;
      page.caseNumber = page._project.getProject().caseNumber;
    }, 5000);
  }

  ngDoCheck () {
    this.clientList = this._project.getProject().litigants;
    this.projectInfo = this._project.getProject().projectInfo;
    this.caseNumber = this._project.getProject().caseNumber;
    this.todo = this._project.getProject().todo;
  }
  ngOnDestroy () {
    if (this.projectTimer) {
      clearInterval(this.projectTimer);
    }
  }
  // 根据屏幕宽度判断显示申请人数量
  showNum(): any {
    jQuery(document).width() < 1400 ? this.showNumber = 1 : this.showNumber = 3
  }

  toTask(link: string): any {
    this.router.navigate([link])
  }

  @HostListener('window:resize')
  public onResize() {
    this.showNum()
  }

  private createDocument (): void {
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.DocAutoCreateService', 'collection', 'createDocument', {caseId: caseId,
      templateTypeId: '816f06764db44323b246590860b1ba3d'}).then(res => {
      if (res.code === 1) {
        window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify([res.result.id]) +
        '&typeId=bd6014657f8d4c199a87013ab3f35982', '_blank');
      }
    })
  }
}
