import { Component, OnInit } from '@angular/core';
import { MetaLoader } from '../../../service/meta-loader.service';
import { RestClient } from '../../../service/rest-client.service';
import { environment } from '../../../../environments/environment';
import { NzMessageService } from '../../../components/message/nz-message.service';

@Component({
  selector: 'app-pandect',
  templateUrl: './pandect.component.html',
  styleUrls: ['./pandect.component.scss']
})
export class PandectComponent implements OnInit {
  private projectInfo;
  private partyInfo;
  private chargeInfo;
  private stuffInfo;
  private documentInfo;
  private pdfLink;

  constructor(
    private restClient: RestClient,
    private _message: NzMessageService
  ) { }

  ngOnInit() {
    if (document.body.scrollTop !== 0) {
      document.body.scrollTop = 0;
    } else {
      document.documentElement.scrollTop = 0;
    }
    const caseId = window.localStorage.getItem('caseId');
    this.getProjectInfo(caseId);
    this.getParty(caseId);
    this.getCharge(caseId);
    this.getStuff(caseId);
    this.getDocment(caseId);
    this.getPdfLink(caseId);
  }

  private getProjectInfo (caseId) {
    if (!caseId) {
      this._message.error('出错啦！');
      return;
    }
    if (MetaLoader.CURRENT_USER) {
      this.restClient.request('dm.Entity', caseId, 'retrieve', { typeId: environment.case_type_id }).then(res => {
        if (res) {
          this.projectInfo = res.$displays;
        } else {
          this._message.error('未获取到数据');
        }
      })
    }
  }

  private getParty (caseId) {
    if (!caseId) {
      this._message.error('出错啦！');
      return;
    }
    this.restClient.request('npm.PartyService', 'collection', 'loadParty', {caseId}).then(res => {
      if (res.code === 1) {
        this.partyInfo = res.result;
      } else {
        this._message.error('未找到数据');
      }
    })
  }

  private getCharge (caseId) {
    if (!caseId) {
      this._message.error('出错啦！');
      return;
    }
    this.restClient.request('dm.DataService', 'fee.Order@queryOrderByCase', 'invoke', {caseId}).then(res => {
      if (res.code === 1) {
        this.chargeInfo = res.result.details;
      } else {
        this._message.error('未找到数据');
      }
    })
  }

  private getStuff (caseId) {
    if (!caseId) {
      this._message.error('出错啦！');
      return;
    }
    this.restClient.request('npm.StuffService', 'collection', 'loadStuff', {caseId}).then(res => {
      if (res.code === 1) {
        this.stuffInfo = res.result;
      } else {
        this._message.error('未找到数据');
      }
    })
  }

  private getDocment (caseId) {
    if (!caseId) {
      this._message.error('出错啦！');
      return;
    }
    this.restClient.request('npm.DocumnetService', 'collection', 'loadDocument', {caseId}).then(res => {
      if (res.code === 1) {
        this.documentInfo = res.result;
      } else {
        this._message.error('未找到数据');
      }
    })
  }

  private getPdfLink (caseId) {
    if (!caseId) {
      this._message.error('出错啦！');
      return;
    }
    this.restClient.request('npm.DossierService', 'collection', 'loadDossierPDF', {caseId}).then(res => {
      if (res.code === 1) {
        this.pdfLink = res.result.dossier
      } else {
        // this._message.error('暂无卷宗！');
      }
    })
  }

}
