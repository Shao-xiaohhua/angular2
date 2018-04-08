import { from } from 'rxjs/observable/from';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataType, Data } from 'ngx-address';
import { Observable } from 'rxjs/Observable';
import { manageData } from '../../model/manage';
import { ProjectService } from '../../service/project.service';
import { Case, Project } from '../../model/case';
import { RestClient } from './../../service/rest-client.service';
import { TasksService } from '../../service/tasks.service';
import { NzMessageService } from '../message/nz-message.service';
import { MetaLoader } from '../../service/meta-loader.service';
import { MachineService } from '../../service/machine.service';
import { environment } from '../../../environments/environment';
import { CaseTypeComponent } from '../register/case-type.component';
@Component({
  selector: 'app-reg',
  templateUrl: './consult.component.html',
  styleUrls: ['./consult.component.scss'],
  providers: [ProjectService, TasksService, NzMessageService, MachineService]
})
export class ConsultComponent implements OnInit {
  private litigantData;
  private addCount: number;
  private title: string[];
  private toggleManage: boolean;
  public id: any;
  public content: String;
  public type: String;
  public custom: any;
  public idCard: any;
  private disabled: boolean;

  private caseCount: number[];
  private caseType;

  @ViewChild(CaseTypeComponent)
  private caseTypeComponent: CaseTypeComponent;
  public selectOptions: any = {
    placeholder: '请选择一个标签',
    language: 'zh-CN',
    theme: 'inspinia',
    width: '100%',
    data: ['选项1', '选项2', '选项3', '选项4', '选项5']
  };

  projects: Project[];

  public readIdCard(info): any {
    if (info) {
      this.idCard = info;
    } else {
      alert('读取身份证失败!');
    }
  };

  public constructor(
    private _project: ProjectService,
    private restClient: RestClient,
    private router: Router,
    private tasksService: TasksService,
    private _message: NzMessageService,
    private machineService: MachineService
  ) {
    let customData = [];
    const types = ['一级', '二级', '三级'];
    this.custom = {
      id: '',
      result: {},
      options: {
        placeholder: '请选择办理的事项',
        className: 'cascader cascader-lg',
        offset: { x: 0, y: 45 },
        types: types,
        http: (index: number, id: string) => {
          return new Observable(observer => {
            const newCustomData = [];
            customData.forEach(element => {
              if (element.index !== index) {
                newCustomData.push(element);
              }
            });
            customData = newCustomData;
            this.restClient.request('npm.CaseTypeService', 'collection', 'loadCaseType', { caseTypeId: id }).then(result => {
              result.result.forEach(element => {
                customData.push({
                  index: index,
                  id: element.id,
                  name: element.properties.name
                });
              });
              const _tmp: Data = {
                type: DataType.list,
                list: customData.filter(w => w.index === index)
              };
              observer.next(_tmp);
              observer.complete();
            });
          });
        }
      }
    };
  }

  ngOnInit() {
    this.caseCount = [Math.random()];
    this.caseType = [];
    this.idCard = {};
    this.title = ['申请人', '关系人'];
    this.disabled = false;
    this.toggleManage = false;
    this.content = "";
    this._project.getProject().litigantData = [[], []];
    this._project.getProject().litigants = [];
    this._project.getProject().litigantOfProxy = [];
    const sessionId = window.localStorage.getItem('__sessionId__');
    if (sessionId) {
      this.machineService.videoRecord(sessionId, 'Stop').then(res => {
        if (res.result === 'Success') {
          console.log('video stop', res);
        }
      });
    }
    this.cleanLocalStorage();
    this.litigantData = this._project.getProject().litigantData;
    this.machineService.redirect('badge', MetaLoader.CURRENT_USER.personId, null);
  }

  private addCase (): void {
    this.caseCount.push(Math.random());
  }

  private deleteCase (i): void {
    this.caseCount.splice(i, 1);
    this.caseType.splice(i, 1);
  }

  private loadCaseVal (value, i): void {
    this.caseType[i] = value;
  }

  private selectType (event): void {
    this.onSubmit(event.target.value);
   // this.router.navigate([event.target.value]);
  }

  private cleanLocalStorage(): void {
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
  }
  private toggle (): void {
    this.toggleManage = !this.toggleManage;
  }

  onCustomSelected(value: any) {
    this.custom.result = value;
  }

  

  removeItem (j, list): void {
    list.splice(j, 1);
  }

  addLitigant (i): void {
    this.addCount = i;
  }

  add (): void {
  }

  onSubmit (path:any): void {
    const json = {
      caseTypeId: this.caseType,
      content:this.content,
      type:this.type,
      persons: []
    };

    path=environment.ctxpath + '/print/print-consultation.jsp?id=';

    this.litigantData.map(v => {
      v.map(vi => {
        json.persons.push(vi)
      })
    })
    if (json.caseTypeId && json.persons.length) {
      this.disabled = true;
     
      json['serialNumber'] = MetaLoader.DEVICE_KEY || '123456789';
      this.restClient.request('ncm.ConsultationService', 'collection', 'submit', { params: JSON.stringify(json) }).then(res => {
        if (res.code==1) {
                  
          console.log(res);
          if (res.result) {
            const {result: {task}} = res;
            window.localStorage.setItem('consultationId', res.result.consultation.id);
            
            path = path +res.result.consultation.id;
            window.open(path, '_blank');

            this.router.navigate(['/business/ncm.Consultation@search']);

            }
        } else {
          this._message.error(res.description);
          this.disabled = false;
          
        }
      })
      

    } else if (!json.caseTypeId) {
      this._message.error('请选择事项');
    } else {
      this._message.error('请添加申请人');
    }
  }
  refresh() {
    this.caseTypeComponent.initOptions();
  }
}
