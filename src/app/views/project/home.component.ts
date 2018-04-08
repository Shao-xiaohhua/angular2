import {  Component, OnDestroy, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { ProjectService } from '../../service/project.service';
import { RestClient } from '../../service/rest-client.service';
import { MachineService } from '../../service/machine.service';
import { environment } from '../../../environments/environment';

declare var jQuery: any;

@Component({
  selector: 'app-project',
  templateUrl: './home.template.html',
  styleUrls: ['./project.component.scss'],
  providers: [RestClient, ProjectService, MachineService]
})

export class HomeComponent implements OnDestroy, OnInit  {

  public nav: any;
  public wrapper: any;
  private navList;
  private currentItem;

  public constructor(
    private router: Router,
    private _project: ProjectService,
    private restClient: RestClient,
    private machineService: MachineService
  ) {
    this.nav = document.querySelector('nav.navbar');
    this.wrapper = document.getElementById('page-wrapper');
  }

  public ngOnInit(): any {
    this.navList = [];
    this.nav.className += ' white-bg';
    const rest = this.restClient.request('tk.Menu', environment.operatorMenuName, 'retrieve', {});
    rest.then(result => {
      const nodes = result ? result.childNodes : result
      if (nodes) {
        nodes.forEach(element => {
          if (element.enabled && element.visible) {
            this.navList.push({
              name: element.name,
              link: element.action,
              icon: element.icon
            });
          }
        });
      } else {
        this.navList = [
          {
            name: '申请表',
            link: '/project/home/settings',
            icon: 'fa-home'
          },
          {
            name: '谈话笔录',
            link: '/project/home/notes',
            icon: 'fa-quote-right'
          },
          {
            name: '身份核验',
            link: '/project/home/identify',
            icon: 'fa-podcast'
          },
          {
            name: '风险告知',
            link: '/project/home/tips',
            icon: 'fa-tty'
          },
          {
            name: '材料管理',
            link: '/project/home/data',
            icon: 'fa-inbox'
          },
          {
            name: '受理审批',
            link: '/project/home/apply',
            icon: 'fa-paper-plane'
          },
          {
            name: '收费管理',
            link: '/project/home/costs',
            icon: 'fa-cny'
          },
          {
            name: '文书管理',
            link: '/project/home/doc',
            icon: 'fa-file-text'
          },
          {
            name: '电子卷宗',
            link: '/project/home/archives',
            icon: 'fa-archive'
          }
        ]
      }
    });
    // this.wrapper.className += ' sidebar-content';

    const currentRoute = this.router.url;
    const homeRoute = this.router.url.substring(0, 13);
    for (let i = 0; i < this.navList.length; i++) {
      if (this.navList[i].link === currentRoute) {
        this.currentItem = this.navList[i]
        break
      }
    }
    const caseId = window.localStorage.getItem('caseId');
    const project = this._project.getProject();
    this._getProjectData(caseId, project);
    this.machineService.redirect('project', caseId, null);
  }

  private _getProjectData (caseId, project) {
    this._getLightData(caseId, project)
    this._getMaterial(caseId, project)
    this._getProjectInfo(caseId, project)
  }

  private _getProjectInfo (caseId, project) {
    this.restClient.request('dm.Entity', caseId, 'retrieve', { typeId: environment.case_type_id }).then(res => {
      project.projectInfo = res.$displays;
      project.caseNumber = res.properties.caseNumber;
    })
  }

  private _getLightData (caseId, project) {
    this.restClient.request('npm.PartyService', 'collection', 'loadParty', {caseId}).then(res => {
      if (res.code === 1) {
        project.litigantData = [[], []];
        project.litigants = res.result;
        res.result.map(v => {
          if (v.role === 'Applicant') {
            project.litigantData[0].push(v)
          } else if (v.role === 'Party') {
            project.litigantData[1].push(v)
          }
        })
        project.litigants.map(v => {
          project.litigantOfProxy.push(v)
          if (v.proxy) {
            project.litigantOfProxy.push(v.proxy)
          }
        })
      }
    })
  }

  private _getMaterial (caseId, project) {
    this.restClient.request('npm.StuffService', 'collection', 'loadStuff', {caseId}).then(res => {
      if (res.code === 1) {
        console.log(res.result)
        project.materials = res.result;
        // res.result.map(v => {
        //   if (v.pages) {
        //     v.pages.map(v => {
        //       if (v.pic) {
        //         project.materialPageHasPic.push(v);
        //       }
        //     })
        //   }
        // })
      }
    })
  }

  public ngOnDestroy(): void {
    this.nav.classList.remove('white-bg');
    this.wrapper.classList.remove('sidebar-content');
  }

  activeRoute(routename: string): boolean {
    return this.router.url.substring(14).indexOf(routename) > -1;
  }

  private selectItem(i): void {
    this.currentItem = this.navList[i];
    const caseId = window.localStorage.getItem('caseId');
    this.machineService.redirect('project', caseId, null);
  }

  private canDeactivate (): boolean {
    this.clearService();
    const video = localStorage.getItem('_HighShotVideo_');
    const camera = localStorage.getItem('_HighShotCamera_');
    const device = localStorage.getItem('_HighShotDevice_');
    const lastTime = localStorage.getItem('_HighShotLastTime_');
    const sessionId = localStorage.getItem('__sessionId__');
    window.localStorage.clear();
    localStorage.setItem('__sessionId__', sessionId !== null ? sessionId : '');
    localStorage.setItem('_HighShotVideo_', video !== null ? video : '');
    localStorage.setItem('_HighShotCamera_', camera !== null ? camera : '');
    localStorage.setItem('_HighShotDevice_', device !== null ? device : '');
    localStorage.setItem('_HighShotLastTime_', lastTime !== null ? lastTime : '');
    return true;
  }

  private clearService (): void {
    this._project.getProject().litigantData = [[], []];
    this._project.getProject().litigants = [];
    this._project.getProject().litigantOfProxy = [];
    this._project.getProject().projectInfo = {};
    this._project.getProject().materials = [];
  }
}
