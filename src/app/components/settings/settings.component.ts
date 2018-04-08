import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../service/project.service';
import { MetaLoader } from '../../service/meta-loader.service';
import { View } from 'app/model/view';
import { Type } from 'app/model/type';
import { Business } from 'app/model/business';
import { Entity } from 'app/model/entity';
import { getType } from '@angular/core/src/errors';
import { RestClient } from './../../service/rest-client.service';
import { environment } from '../../../environments/environment';
import { MachineService } from '../../service/machine.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [MachineService]
})
export class SettingsComponent implements OnInit {
  config: Object = {};
  public entity: Entity;
  public entityId: String;
  private typeId: any;
  constructor(
    private _project: ProjectService,
    private restClient: RestClient,
    private machineService: MachineService,
    private router: Router
  ) { }

  ngOnInit() {
    const caseId = window.localStorage.getItem('caseId');
    this.entityId = caseId;
    const rest = this.restClient.request('dm.Entity', caseId, 'retrieve', { typeId: environment.case_type_id });
    rest.then(result => {
      this.entity = result;
      if (result) {
        this.entityId = result['id'];
        this.typeId = result['typeId'];
        if (result.properties.status && result.properties.status === 'Refused') {
          window.localStorage.setItem('apply-view', 'form');
          this.router.navigateByUrl('/project/home/apply');
        }
      }
  });
  // this.machineService.sendAction('/project');
  this.machineService.redirect('project', caseId, null);
  }

  get view(): View {
    return this.type.getView('detail').definition;
  }
  get type(): Type {
     return MetaLoader.loadType(this.typeId);
  }

  get business(): Business {
    return this.type.getBusiness('ng-edit');
  }

  public printApplyDoc() {
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.DocAutoCreateService', 'collection', 'createApplicationDocument', {caseId: caseId}).then(res => {
      if (res.code === 1) {
        window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify(res.result) +
        '&typeId=bd6014657f8d4c199a87013ab3f35982', '_blank');
      }
    });
  }
}
