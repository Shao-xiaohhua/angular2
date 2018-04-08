import { parse } from 'url';
import { Component, OnInit, OnChanges, DoCheck, ViewChild } from '@angular/core';
import { PerfectScrollbarComponent, PerfectScrollbarConfigInterface, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { directiveDef } from '@angular/core/src/view/provider';
import { RestClient } from './../../service/rest-client.service';
import { ProjectService } from '../../service/project.service';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

import { NzMessageService } from '../message/nz-message.service';
declare var jQuery: any;
@Component({
  selector: 'app-talknotes',
  templateUrl: './talknotes.component.html',
  styleUrls: ['./talknotes.component.scss'],
  providers: [RestClient]
})
export class TalknotesComponent implements OnInit, DoCheck {

  private identList;
  private isFullscreen: boolean;
  private optionSelected;
  private talkNote: any = {
    id : '',
    content : ''
  };
  private jsonData: any;

  private range: any;

  private notaryName; String = '';

  private caseType = '';

  private partyName = '';

  private helpLink;

  @ViewChild(PerfectScrollbarComponent) componentScroll: PerfectScrollbarComponent;

  private selectOptions: any = {
    placeholder: '选择或搜索笔录模板',
    language: 'zh-CN',
    theme: 'inspinia',
    width: '100%',
    data: [
      {
        id: '001',
        text: '模板一'
      },
      {
        id: '002',
        text: '模板二'
      }
    ],
  };

  public dayTimeConf: any = {
    locale: 'zh-cn',
    format: 'YYYY年MM月DD日'
  };

  constructor(
    private restClient: RestClient,
    private _project: ProjectService,
    private sanitizer: DomSanitizer,
    private _message: NzMessageService
  ) { }

  ngOnInit() {
    this.identList = [];
    this.isFullscreen = false;
    this.helpLink = environment.serverUrl;
    const caseId = window.localStorage.getItem('caseId');
    const rest = this.restClient.request('inm.CaseService', caseId, 'loadTreeData', { }).then(result => {
      if (result.code === 1) {
        this.jsonData = result.result;
        this.notaryName = this.jsonData.nbm_Case.properties.notary;
        this.caseType = this.jsonData.nbm_Case.properties.caseType;
      }
    });
    this.loadTalkNote();
  }

  ngDoCheck () {
    this.identList = this._project.getProject().litigantOfProxy;
    this.partyName = '';
    this.identList.forEach(element => {
      if (this.partyName && this.partyName.length > 0) {
        this.partyName = this.partyName + '  ';
      }
      this.partyName = this.partyName + element.name;
    });
  }

  private toggleFS(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  saveTalkNote () {
    const caseId = window.localStorage.getItem('caseId');
    const talkNoteHtml = jQuery('#edit-aera').html();
    if (!talkNoteHtml) {
      return;
    }
    this.talkNote.content = this.sanitizer.bypassSecurityTrustHtml(talkNoteHtml);
    const params = {
      caseId: caseId,
      talkNote : {
        id: this.talkNote.id,
        content: talkNoteHtml
      }
    }
    this.restClient.request('npm.TalkNoteService', 'collection', 'saveTalkNote', { params: JSON.stringify(params) }).then(res => {
      if (res.code === 1) {
        this.talkNote.id = res.result.id;
        this._message.success('保存数据成功');
        this._project.getTasks();
      } else {
        this._message.error(res.description);
      }
    });
  }
  loadTalkNote () {
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.TalkNoteService', 'collection', 'loadTalkNote', { caseId: caseId }).then(res => {
      if (res.code === 1) {
        this.talkNote.id = res.result.id;
        this.talkNote.content = this.sanitizer.bypassSecurityTrustHtml(res.result.properties.content);
      }
    });
  }
  loadTalkTemp (event) {
    const talkTempId = event;
    this.restClient.request('npm.DocTemplateService', 'collection', 'loadTemp', { templateId: talkTempId }).then(res => {
      if (res.code === 1) {
        this.talkNote.content = this.sanitizer.bypassSecurityTrustHtml(res.result.properties.content);
        this.parseDoc ();
      }
    });
  }

  CNDateString() {
    const date = new Date();
    const cn = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const s = [];
    const YY = date.getFullYear().toString();
    for (let i = 0; i < YY.length; i++) {
      if (cn[YY.charAt(i)]) {
        s.push(cn[YY.charAt(i)]);
      }else {
        s.push(YY.charAt(i));
      }
    }
    s.push('年');
    const MM = date.getMonth() + 1;
    if (MM < 10) {
      s.push(cn[MM]);
    } else if (MM < 20) {
      s.push('十' + cn[MM % 10]);
    }
    s.push('月');
    const DD = date.getDate();
    if (DD < 10) {
      s.push(cn[DD]);
    } else if (DD < 20) {
      s.push('十' + cn[DD % 10]);
    } else {
      s.push('二十' + cn[DD % 10]);
    }
    s.push('日');

    return s.join('');
  }
  getRange() {
    const newRange = window.getSelection().getRangeAt(0);
    const srcele = newRange.startContainer.parentElement;
    if (jQuery(srcele).attr('contenteditable')) {
      return;
    }
    if (jQuery(srcele).attr('homolo-build-innerhtml')) {
      return;
    }
    if (jQuery(srcele).attr('homolo-build-template')) {
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
        if (currentTemplateHtmlValue.indexOf('</p>') < 0) {
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

  printTalkNote () {
    window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify([this.talkNote.id]) +
    '&typeId=318eedf9e25a42ddb93918cab988f30c', '_blank');
  }
}
