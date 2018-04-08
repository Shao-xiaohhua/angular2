import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './data.service';
import { RestClient } from './rest-client.service';
import { NzMessageService } from '../components/message/nz-message.service';
import { environment } from '../../environments/environment';
import { MetaLoader } from '../service/meta-loader.service';
const projectData = {
  projectInfo: {},
  caseNumber: '',
  litigantData: [
    [],
    []
  ],
  todo: [],
  litigants: [],
  litigantOfProxy: [],
  materials: [],
  materialPageHasPic: [],
  invoiceList: [],
  chargeData: {} // 收费信息
}

@Injectable()
export class ProjectService {

  constructor(
    private dataService: DataService,
    private restClient: RestClient,
    private router: Router,
    private _message: NzMessageService
  ) { }

  public getProject () {
    return projectData;
  }

  public getMaterialPage (i: number) {
    return projectData.materials[i];
  }

  public addClient (params) {
    const caseId = window.localStorage.getItem('caseId')
    this.restClient.request('npm.PartyService', 'collection', 'saveParty', {params}).then(res => {
      if (res.code === 1) {
        projectData.litigants = res.result;
        projectData.litigantData[0] = res.result;
        projectData.litigantOfProxy = res.result;
      }
    })
  }

  public getTasks() {
    const caseId = window.localStorage.getItem('caseId')
    this.restClient.request('npm.WaitTaskService', 'collection', 'loadWaitTask', { caseId }).then(res => {
      if (res.code === 1) {
        projectData.todo = res.result
      } else {
        this._message.error('未成功获取任务');
      }
    })
  }
  public loadCase() {
    const caseId = window.localStorage.getItem('caseId')
    if (!caseId) {
      return;
    }
    if (MetaLoader.CURRENT_USER) {
      this.restClient.request('dm.Entity', caseId, 'retrieve', { typeId: environment.case_type_id }).then(res => {
        if (res) {
          projectData.projectInfo = res.$displays;
          projectData.caseNumber = res.properties.caseNumber;
        } else {
          this._message.error('未成功获取公证事项');
        }
      })
    }
  }

  public submitMaterialVerif (params) {
    this.restClient.request('npm.StuffVerificationService', 'collection', 'stuffVerification', {params: JSON.stringify(params)})
    .then(res => {
      if (res.code === 1) {
        this._message.success('材料核验结果已提交成功');
      } else {
        this._message.error('材料核验结果提交出错，请重新提交');
      }
    })
  }

  public submitIdent (params) {
    this.restClient.request('npm.IdentityVerificationService', 'collection', 'partyVerification', {params: JSON.stringify(params)})
    .then(res => {
      if (res.code === 1) {
        // this._message.success('申请人核验结果已提交成功');
      } else {
        this._message.error('申请人核验结果提交出错，请重新核验');
      }
    })
  }

  public submitMaterial (params, callback) {
    this.restClient.request('npm.StuffFileService', 'collection', 'upload', {params: JSON.stringify(params)})
    .then(res => {
      if (res.code === 1) {
        // this._message.success('当前材料已提交成功。');
        const caseId = window.localStorage.getItem('caseId');
        this.restClient.request('npm.StuffService', 'collection', 'loadStuff', {caseId}).then(resp => {
          if (resp.code === 1) {
            projectData.materials = resp.result;
            callback();
          }
        })
      } else {
        this._message.error('当前材料提交失败，请重新提交');
      }
    })
  }

  public submitTip () {
    const taskId = window.localStorage.getItem('taskId');
    this.restClient.request('npm.RiskInformedService', 'collection', 'informed', {taskId})
    .then(res => {
      if (res.code === 1) {
        this._message.success('确认已告知');
        this.router.navigate(['project/home']);
      }
    })
  }

  public removeMaterial (stuffFileId) {
    this.restClient.request('npm.StuffFileService', 'collection', 'deleteStuffFile', {stuffFileId}).then(res => {
      if (res.code === 1) {
        this._message.success('删除当前材料成功');
      } else {
        this._message.success('删除当前材料成功');
      }
    })
  }

  public removeMaterials (stuffId) {
    this.restClient.request('npm.StuffService', 'collection', 'deleteStuff', {stuffId}).then(res => {
      if (res.code === 1) {
        this._message.success('删除材料组成功');
      } else {
        this._message.success('删除材料组成功');
      }
    })
  }

  public getInvoice(params) {
    this.restClient.request('fee.InvoiceManage', 'collection', 'cilling', params).then(res => {
      if (res.code === 1) {
        this._message.success('开票成功');
      } else {
        this._message.error('开票失败，请稍后重试');
      }
    })
  }

  public getTempFeeDetail() {
    const caseId = window.localStorage.getItem('caseId')
    this.restClient.request('fee.FeeModelService', 'collection', 'loadFeeDetail', { caseId }).then(res => {
      if (res.code === 1) {
        projectData.invoiceList = res.result.feeDetail;
      } else {
        this._message.error('未获取到费用明细，请稍后重试');
      }
    })
  }

  public getCharge() {
    const caseId = window.localStorage.getItem('caseId')
    this.restClient.request('dm.DataService', 'fee.Order@queryOrderByCase', 'invoke', { caseId }).then(res => {
      if (res.code === 1) {
        console.log(res.result);
        projectData.chargeData = res.result;
      } else {
      }
    })
  }
  public updateOrder(obj) {
    this.restClient.request('dm.DataService', 'fee.Order@updateOrder', 'invoke', { 'orderJson': obj }).then(res => {
      if (res.code === 1) {
        console.log(res);
      } else {
        this._message.error('更新订单失败，请稍后重试');
      }
    })
  }
  public submitOrder(obj) {
    this.restClient.request('inm.FrontScreen', 'collection', 'submitCharge', { 'id': obj.id }).then(res => {
      if (res.code === 1) {
        console.log(res);
      } else {
        this._message.error('更新订单失败，请稍后重试');
      }
    })
  }
  public reWriteOrder(obj) {
    this.restClient.request('inm.FrontScreen', 'collection', 'reWriteCharge', { 'id': obj.id }).then(res => {
      if (res.code === 1) {
        console.log(res);
      } else {
        this._message.error('更新订单失败，请稍后重试');
      }
    })
  }
}
