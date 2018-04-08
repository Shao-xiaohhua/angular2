import { Component, OnInit, ViewChild, DoCheck, OnDestroy } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ProjectService } from '../../service/project.service';
import { NzMessageService } from '../message/nz-message.service';
import { environment } from '../../../environments/environment';
import { MachineService } from './../../service/machine.service';
import { RestClient } from './../../service/rest-client.service';

export interface Invoice {
  amount: number;
  code?: string;
  feeType: string;
  feeTypeName: string;
  id: string;
  isChargeNum?: boolean;
  isFlexibleFees?: boolean;
  isNecessity?: boolean;
  edit?: boolean;
  name: string;
  num: number;
  productCode?: string;
  spec?: string;
  taxRate: number;
  type: string;
  unit: string;
  unitPrice: number;
}

@Component({
  selector: 'app-costs',
  templateUrl: './costs.component.html',
  styleUrls: ['./costs.component.scss'],
  providers: [NzMessageService, MachineService, RestClient]
})
export class CostsComponent implements OnInit, DoCheck, OnDestroy {
  @ViewChild('invoiceModal') invoiceModal: ModalDirective;
  @ViewChild('changeCostModal') changeCostModal: ModalDirective

  public typeId;
  public showCost;
  public isPay: boolean;  // 是否支付
  public isInvoice: boolean;  // 是否已开票
  public projectInfo;
  public invoiceList: Invoice[];  // 可选择收费明细列表
  private currentInvoice: Invoice;
  public storageNum;
  public subTotal;  // 小计和总计
  public invoiceType;  // 开票类型(公司或个人)
  public payeeInfo;  // 收款人信息

  private costList;

  private totalMoney: number;

  public stemp;  // 临时时间戳

  private charge;
  checkTimer;
  constructor(
    private _project: ProjectService,
    private machineService: MachineService,
    private _message: NzMessageService,
    private restClient: RestClient,
  ) { }

  ngOnInit() {
    this.isPay = true;
    this.showCost = false;
    this.isInvoice = false;
    this.invoiceType = 'public';
    this._project.getTempFeeDetail();
    this._project.getCharge();
    this.stemp = Date.now();
    this.payeeInfo = {
      name: '',
      item: '',
      mobile: '',
      amount: ''
    }
    setTimeout(() => {
      this.analysisCharge();
      this.calcTotalMoney();
    }, 1000);
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
  }

  ngDoCheck() {
    this.analysisSelectCharge();
    this.projectInfo = this._project.getProject().projectInfo;
    this.payeeInfo.item = this.projectInfo.caseType + '公证';
    this.payeeInfo.amount = this.subTotal + '';
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
  }

  private analysisSelectCharge(): void {
    const list = this._project.getProject().invoiceList;
    const selectList = [];
    for (const i in list) {
      if (list[i]) {
        const o = list[i];
        if (o['isNecessity'] !== true) {
          selectList.push(o);
        }
      }
    }
    this.invoiceList = selectList;
  }
  private analysisCharge(): void {
    const chargeData = this._project.getProject().chargeData;
    const showList = [];
    for (const i in chargeData['details']) {
      if (chargeData['details'][i]) {
        const o = chargeData['details'][i];
        showList.push(o);
      }
    }
    chargeData['details'] = showList;
    this.charge = chargeData;
    this.getSum();
    if (this.charge['status'] === 'PaySuccess' ) {
      if (this.checkTimer) {
        clearInterval(this.checkTimer);
      }
    }
  }

  private invoiceModalShow(): void {
    this.invoiceModal.show();
  }

  getSum(): void {
    let sum = 0;
    for (let i = 0; i < this.charge['details'].length; i++) {
      sum += (this.charge['details'][i].amount);
    }
    this.charge['amount'] = sum || 0;
  }

  submitFee(): void {

  }

  submit(): void {
    this.invoiceModal.hide();
    const json = this.payeeInfo;
    this._project.getInvoice(json);
    setTimeout(() => {
      this.isInvoice = true;
    }, 2000);
  }

  editPrice(i): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
    this.storageNum = this.charge['details'][i].amount;
    this.charge['details'][i].edit = !this.charge['details'][i].edit;
    this.charge['details'][i].unitPrice = this.charge['details'][i].amount / this.charge['details'][i].num;
  }

  cancelPrice(i): void {
    this.charge['details'][i].amount = this.storageNum;
    this.charge['details'][i].edit = !this.charge['details'][i].edit;
    this.calcTotalMoney();
  }

  updateOrder(): void {
    const me = this;
    this._project.updateOrder(this.charge);
    setTimeout(() => {
      me._project.getCharge();
      me.analysisCharge();
      const caseId = window.localStorage.getItem('caseId');
      const checkcode = window.localStorage.getItem('CHECKCODE');
      this.machineService.redirect('charge', caseId, null);
      me.checkStatus();
      me.stopDealCase('stopCase', caseId, checkcode)
    }, 500);
  }
  submitOrder(): void {
    const me = this;
    this._project.updateOrder(this.charge);
    setTimeout(() => {
      this._project.submitOrder(this.charge);
      me._project.getCharge();
      me.analysisCharge();
      const caseId = window.localStorage.getItem('caseId');
      this.machineService.redirect('charge', caseId, null);
      me.checkStatus();
    }, 500);
  }
  reWriteOrder(): void {
    const me = this;
    this._project.reWriteOrder(this.charge);
    setTimeout(() => {
      me._project.getCharge();
      me.analysisCharge();
      const caseId = window.localStorage.getItem('caseId');
      this.machineService.redirect('project', caseId, null);
      me.checkStatus();
    }, 500);
  }
  pay(): void {
    const caseId = window.localStorage.getItem('caseId');
    this.machineService.redirect('charge', caseId, null);
    this.checkStatus();
  }
  checkStatus(): void {
    const me = this;
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
    this.checkTimer = setInterval(() => {
      me._project.getCharge();
      me.analysisCharge();
    }, 3000);
  }

  private confirm (costData): void {
    this.changeCostModal.hide();

    if (!costData.currentCost) {
      return;
    };

    costData.currentCostList.name += (costData.todo ? '-' + costData.todo : '');

    this.charge.details.push(costData.currentCostList)
    this.calcTotalMoney();
  }

  private addCharge (): void {
    this.costList = this.invoiceList;
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
  }

  private deleteCharge (item, i: number): void {
    if (confirm('是否删除此收费项？')) {
      this.charge.details.splice(i, 1);
      this.calcTotalMoney();
    }
  }

  private calcTotalMoney (): void {
    this.totalMoney = 0;
    this.charge.details.map(v => {
      this.totalMoney += (v.amount * v.num);
    })
    this.charge.amount = this.totalMoney;
  }

  private addOne (item): void {
    item.num = Number(item.num) + 1;
    this.calcTotalMoney();
  }

  private reduceOne (item): void {
    if (Number(item.num) <= 0) {
      item.num = 0;
    } else {
      item.num = Number(item.num) - 1;
    }
    this.calcTotalMoney();
  }
  private createDocument (): void {
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.DocAutoCreateService', 'collection', 'createOrUpdateDocument', {caseId: caseId,
      templateTypeId: '1e9a86336c3843be8be8680c8a4ed58f'}).then(res => {
      if (res.code === 1) {
        window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify([res.result.id]), '_blank');
      } else {
        this._message.error(res.description);
      }
    })
  }

  stopDealCase(action, validate, checkcode) {
    this.machineService.actionRecord(action, validate, checkcode, 'Stop').then(res => {
      if (res.result === 'Success') {
        console.log('actionRecord stop', res);
      }
    });
  }
}
