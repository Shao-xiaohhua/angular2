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
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [ProjectService, TasksService, NzMessageService, MachineService]
})
export class RegComponent implements OnInit {
  private litigantData;
  private addCount: number;
  private title: string[];
  private toggleManage: boolean;
  public id: any;
  public custom: any;
  public idCard: any;
  private disabled: boolean;

  private count: number;

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
    this.count = 1;
    this.idCard = {};
    this.title = ['申请人', '关系人'];
    this.disabled = false;
    this.toggleManage = false;

    this._project.getProject().litigantData = [[], []];
    this._project.getProject().litigants = [];
    this._project.getProject().litigantOfProxy = [];
    this.cleanLocalStorage();
    this.litigantData = this._project.getProject().litigantData;
    this.machineService.redirect('badge', MetaLoader.CURRENT_USER.personId, null);
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

  onSubmit (): void {
    const json = {
      caseTypeId: '',
      persons: []
    };
    json.caseTypeId = window.localStorage.getItem('caseTypeId')
    this.litigantData.map(v => {
      v.map(vi => {
        json.persons.push(vi)
      })
    })
    if (json.caseTypeId && json.persons.length) {
      this.disabled = true;
      json['serialNumber'] = MetaLoader.DEVICE_KEY || '123456789';
      this.restClient.request('inm.CaseService', 'collection', 'submit', { params: JSON.stringify(json) }).then(res => {
        if (res.code) {
          if (res.result) {
            const {result: {task}} = res;
            window.localStorage.setItem('caseId', res.result.case.id);
            window.localStorage.setItem('CHECKCODE', res.result.case.properties.checkCode);
            this.startDealCase('startCase', res.result.case.id, res.result.case.properties.checkCode);
          } else {
            window.localStorage.setItem('caseId', '');
            window.localStorage.setItem('CHECKCODE', '');
          }
          this._message.success('案件提交中');
          this.router.navigate(['/project/regulator']);
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

  setCaseType(event) {
    window.localStorage.setItem('caseTypeId', event);
  }

  startDealCase(action, validate, checkcode) {
    this.machineService.actionRecord(action, validate, checkcode, 'Start').then(res => {
      if (res.result === 'Success') {
        console.log('actionRecord start', res);
      }
    });
  }
}
