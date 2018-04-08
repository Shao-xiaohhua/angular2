import { Component, OnInit } from '@angular/core';
import { ProjectService } from './../../service/project.service';
import { DraftService } from './../../service/draft.service';
import { RestClient } from './../../service/rest-client.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NzMessageService } from '../message/nz-message.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
declare var jQuery: any;

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.scss'],
  providers: [ProjectService, DraftService, RestClient]
})

export class DraftComponent implements OnInit {
  private litigantData;
  private litigants = [];
  private activeLitigant = [];
  private activeBirthDate = [];
  private caseType = '';
  private translateLanguage = '';
  private num = '';
  private attestation = '';
  private draftNote: String;
  private jsonData: any;
  private doc: any = {
    typeId: '',
    id : '',
    category: '',
    content : '',
    templateId : ''
  };
  private range: any;
  constructor(
    private _project: ProjectService,
    private draftService: DraftService,
    private restClient: RestClient,
    private sanitizer: DomSanitizer,
    private _message: NzMessageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.litigantData = this._project.getProject().litigantData;
    this.litigantData.map((val) => {
      val.map((v) => {
        v.isActive = true;
        this.litigants.push(v);
      })
    })
    this.activeLitigant = this.draftService.getActiveLitigant();
    const caseId = window.localStorage.getItem('caseId');
    const rest = this.restClient.request('inm.CaseService', caseId, 'loadTreeData', { }).then(result => {
      if (result.code === 1) {
        this.jsonData = result.result;
        this.caseType = this.jsonData.nbm_Case.properties.caseType;
        this.translateLanguage = this.jsonData.nbm_Case.properties.translateLanguage;
        this.num = this.jsonData.nbm_Case.properties.num;
        this.attestation = this.jsonData.nbm_Case.properties.attestation;
        this.draftNote = this.jsonData.nbm_Case.properties.draftNote;
      }
    });
    this.loadDoc();
  }

  private addLitigant (item): void {
    item.birthDate = this.filterBirthData(item.birthDate)
    if (item.isActive) {
      this.activeLitigant.push(item)
    } else {
      this.activeLitigant.splice(this.activeLitigant.findIndex(v => v === item), 1)
    }
    item.isActive = !item.isActive
  }

  private delLitigant (item): void {
    item.isActive = true
    this.activeLitigant.splice(this.activeLitigant.findIndex(v => v === item), 1)
  }

  private filterBirthData (birthDate) {
    if (!birthDate || typeof birthDate === 'number') {
      return;
    }
    let str = '';
    const days = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    for (let i = 0; i < birthDate.length; i++) {
      str += days[birthDate[i]]
    }
    return str
  }
  getJson(buildName: String, data: any) {
    if (buildName) {
      const names = buildName.split('.');
      let buildValue = data;
      names.forEach(nameValue => {
        if (buildValue) {
          const value = buildValue[nameValue];
          if (value) {
            buildValue = value;
          }
        }
      });
      return buildValue;
    }
    return null;
  }
  parseArray (innerHtmlValue: any, data: any) {
    const templateHtmls = jQuery(innerHtmlValue).find('[homolo-build-template="true"]');
    let templateHtmlStr = '';
    let templateHtmlValue = '';
    if (templateHtmls) {
      const templateHtml = templateHtmls[0];
      jQuery(templateHtml).attr('id', 'templateHtml');
      templateHtmlStr = jQuery(templateHtml).prop('outerHTML');
      jQuery(innerHtmlValue).html(templateHtmlStr);
    }
    let b = false;
    data.forEach(dataValue => {
      const templateHtmlData: any = jQuery('#templateHtml').find('[homolo-build-template-field="true"]');
      for (let i = 0; i < templateHtmlData.length; i ++) {
        const buildName = jQuery(templateHtmlData[i]).attr('homolo-build-innerHtml');
        const buildValue = this.getJson(buildName, dataValue);
        if (buildValue) {
          jQuery(templateHtmlData[i]).html(buildValue);
        }
      }
      let currentTemplateHtmlValue = jQuery('#templateHtml').prop('outerHTML');
      currentTemplateHtmlValue = currentTemplateHtmlValue.replace('templateHtml', '');
      if (b) {
        currentTemplateHtmlValue = currentTemplateHtmlValue.replace('homolo-build-template="true"', '');
        if (currentTemplateHtmlValue.indexOf('<br>') < 0) {
          templateHtmlValue = templateHtmlValue + '&nbsp;&nbsp;'
        }
      }
      b = true;
      templateHtmlValue = templateHtmlValue + currentTemplateHtmlValue;
    });
    jQuery(innerHtmlValue).html(templateHtmlValue);
  }

  parseDoc () {
    const caseId = window.localStorage.getItem('caseId');
    const rest = this.restClient.request('inm.CaseService', caseId, 'loadTreeData', { });
    rest.then(result => {
      if (result.code === 1) {
        this.jsonData = result.result;
        const innerHtmlData: any = jQuery.find('[homolo-build="true"]');
        innerHtmlData.forEach(innerHtmlValue => {
          const buildName = jQuery(innerHtmlValue).attr('homolo-build-innerHtml');
          if (buildName) {
            const buildValue = this.getJson(buildName, this.jsonData);
            if (buildValue && buildValue instanceof Array) {
              this.parseArray(innerHtmlValue, buildValue);
            } else if (buildValue) {
              jQuery(innerHtmlValue).html(buildValue);
            }
          }
        })
      }
    });
  }
  loadTemplate (event) {
    const templateId = event;
    if (this.doc.templateId && this.doc.templateId === templateId) {
      return;
    }
    this.restClient.request('npm.DocTemplateService', 'collection', 'loadTemp', { templateId: templateId }).then(res => {
      if (res.code === 1) {
        this.doc.content = this.sanitizer.bypassSecurityTrustHtml(res.result.properties.content);
        this.doc.typeId = res.result.properties.docType;
        this.doc.category = res.result.properties.category;
        this.doc.templateId = res.result.id;
        this.parseDoc ();
      }
    });
  }

  getRange() {
    const newRange = window.getSelection().getRangeAt(0);
    const srcele = newRange.startContainer.parentElement;
    if (jQuery(srcele).attr('contenteditable')) {
      return;
    }
    this.range = window.getSelection().getRangeAt(0);
  }

  insertIntoRange (str) {
    if (!this.range) {
      this._message.error('请把光标点到需要插入数据的位置!');
      return;
    }
    const nodeHtml = document.createElement('span');
    nodeHtml.setAttribute('contenteditable', 'false');
    nodeHtml.setAttribute('class', 'keyword');
    nodeHtml.innerText = str;
    this.range.insertNode(nodeHtml);
  }

  saveDoc () {
    const caseId = window.localStorage.getItem('caseId');
    const docHtml = jQuery('#edit-aera').html();
    if (!docHtml) {
      this._message.error('文书内容不能为空');
      return;
    }
    const params = {
      caseId: caseId,
      draftNote: this.draftNote,
      doc : {
        id: this.doc.id,
        category: this.doc.category,
        typeId: this.doc.typeId,
        content: docHtml,
        templateId: this.doc.templateId
      }
    }
    this.restClient.request('npm.DocumnetService', 'collection', 'saveDocument', params).then(res => {
      if (res.code === 1) {
        this.doc.id = res.result.id;
        this._message.success('保存数据成功');
        this.router.navigate(['/dashboard']);
      } else {
        this._message.error(res.description);
      }
    });
  }
  loadDoc () {
    const caseId = window.localStorage.getItem('caseId');
    const params = { caseId: caseId, typeId: '213e348b28294558bcc53e45aab6a6d5' }
    this.restClient.request('npm.DocumnetService', 'collection', 'loadDoc', params).then(res => {
      if (res.code === 1) {
        this.doc.id = res.result.id;
        this.doc.category = res.result.properties.category;
        this.doc.templateId = res.result.properties.templateId;
        this.doc.typeId = res.result.typeId;
        this.doc.content = this.sanitizer.bypassSecurityTrustHtml(res.result.properties.content);
      }
    });
  }
  private print() {
    window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify([this.doc.id]) +
    '&typeId=213e348b28294558bcc53e45aab6a6d5', '_blank');
  }
}
