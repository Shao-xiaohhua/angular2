import { Component, OnInit, DoCheck } from '@angular/core';
import { Materials, Page } from '../../model/material';
import { ProjectService } from '../../service/project.service';
import { MetaLoader } from '../../service/meta-loader.service';
import { View } from 'app/model/view';
import { Type } from 'app/model/type';
import { Business } from 'app/model/business';
import { Entity } from 'app/model/entity';
import { RestClient } from './../../service/rest-client.service';
import { NzMessageService } from '../../components/message/nz-message.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss'],
  providers: [ProjectService, RestClient]
})
export class CertificateComponent implements OnInit, DoCheck {
  private currentMatter;
  private currentPhoto;
  private materials;
  private tips;
  private isFullscreen: boolean;
  private materialsIndex;
  private photoIndex;
  private helpLink;
  private isLoading;
  private showResult;
  private resultError;
  private note;
  private verificationMaterial;
  private scene: string;
  private currentResult;

  config: Object = {};
  public entity: Entity;
  view: View;

  educationData: Object = {};
  contentData;
  resultData;
  constructor(
    private _project: ProjectService,
    private _message: NzMessageService,
    private restClient: RestClient
  ) { }

  ngOnInit() {
    this.scene = 'wait';
    this.currentResult = {
      text: '',
      icon: ''
    };
    this.materialsIndex = 0;
    this.photoIndex = 0;
    this.isFullscreen = false;
    this.currentPhoto = {};
    this.helpLink = environment.serverUrl;
    this.isLoading = false;
    this.showResult = false;
    this.resultError = false;
    this.tips = [];
    /* this.view = MetaLoader.loadType('ocr.EducationStructure').getView('structure').definition;
    console.log(this.view); */
    /* const rest = this.restClient.request('dm.Entity', caseId, 'retrieve', { typeId: '' });
    console.log('load data-->',  rest);
    rest.then(result => {
      console.log('loadData...', result);
      this.entity = result;
      if (result) {
        this.entityId = result['id'];
      }
    }); */

    this.getTipData.call(this);

  }

 private getTipData ():void {
  const caseId = window.localStorage.getItem('caseId');
  const json = {
          caseId: caseId,
     };
   
    this.restClient.request('npm.StuffVerificationService', 'collection', 'tips', { params: JSON.stringify(json) }).then(res => {
      if (res.code==1) {
               
        var arr = []
        for (var i in res.result) {
          arr.push(res.result[i]); //属性
        }
        this.tips = arr;
        console.log(this.tips); 
        
      } else {
        this._message.error(res.description);
      }
                
    })
}

  private redirScene (scene): void {
    this.scene = scene;
    if("semResult"==scene){
    const caseId = window.localStorage.getItem('caseId');
    const json = {
      caseId: caseId,
      stuff: this.currentMatter,
      note: this.note,
      verificationMaterial: this.verificationMaterial,
      };

      console.log(json);
      
      this.restClient.request('npm.StuffVerificationService', 'collection', 'materialsVerify', { params: JSON.stringify(json) }).then(res => {
        if (res.code==1) {
                
          console.log(res);
          if (res.result) {
                this.getTipData();
            }
        } else {
          this._message.error(res.description);
        }
                  
      })

    } 
  
  }
  private semSuccess (): void {

    this.verificationMaterial="pass";
    this.currentResult = {
      text: '通过检查',
      icon: 'fa-check-circle'
    }
  }

  private semError (): void {
    this.verificationMaterial="fail";
    this.currentResult = {
      text: '未通过核查',
      icon: 'fa-times-circle'
    }
  }

  get type(): Type {
    return MetaLoader.loadType('ocr.EducationStructure');
  }

  get business(): Business {
    return MetaLoader.loadBusiness('ocr.EducationStructure@search');
  }

  ngDoCheck() {
    this.materials = this._project.getProject().materials;
    this.currentMatter = this.materials[this.materialsIndex];
    if (this.currentMatter) {
      this.currentPhoto = this.currentMatter.pages[this.photoIndex];
    }
  }

  private selectedMatter(i): void {
    this.currentMatter = this.materials[i]
    this.materialsIndex = i;
    this.photoIndex = 0;
    this.currentPhoto = this.currentMatter.pages[this.photoIndex];

    this.educationData = {};
    this.contentData = '';
    this.isLoading = false;
    this.showResult = false;
    this.resultError = false;
    this.scene = 'sem';
  }

  private selectedPhoto (i): void {
    this.currentPhoto = this.currentMatter.pages[i]
  }

  private canDeactivate (): boolean {
    this.materials = [];
    return true;
  }

  private toggleFS(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  private prev(): void {
    if (this.photoIndex > 0) {
      this.photoIndex --;
    } else {
      this.photoIndex = this.currentMatter.pages.length - 1;
    }
  }

  private next(): void {
    this.photoIndex ++;
    if (this.photoIndex > (this.currentMatter.pages.length - 1)) {
      this.photoIndex = 0
    }
  }

  private sendOcr(): void {
    this.isLoading = true;
    this.showResult = false;
    this.resultError = false;
    if (this.currentMatter && this.currentMatter.ocr === '43dd40c7790b44a19c92516f1f3551be') {
      this.ocrEducation();
    }else {
      this.ocrGeneral();
    }
  }

  private ocrGeneral(): void {
    const that = this;
    const fileId = this.loadFileId();
    const rest = this.restClient.request('npm.CertificateCenterService', 'collection', 'generalByFileId', { fileId: fileId });
    rest.then(result => {
      if (result.code === 1) {
        const keys = result.result.words_result;
        let str = '';
        for (let i = 0; i < keys.length; i++) {
          str += keys[i].words + '#';
        }
        that.contentData = str;
      } else {

      }
      that.isLoading = false;
    });
    rest.catch(req => {
      that.isLoading = false;
    })
  }
  private ocrEducation(): void {
    const me = this;
    const fileId = this.loadFileId();
    const rest = this.restClient.request('chsiServer', 'collection', 'ocr', { fileId: fileId });
    rest.then(result => {
      if (result.code === 1) {
        this.educationData = result.result.content['object'];
        this.educationData['content'] = result.result.content['ocr_result_str'];
      }
      me.isLoading = false;
    });
    rest.catch(req => {
      me.isLoading = false;
    })
  }

  private loadFileId(): any {
    const p = this.currentPhoto.pic;
    if (p) {
      const index = p.indexOf('tk.File/');
      const ss = p.substring(index);
      const fileId = ss.replace('tk.File/', '').replace('/', '');
      if (fileId) {
        return fileId;
      }
    }
    return null;
  }

  private sendCenter(): void {
    this.isLoading = true;
    this.showResult = false;
    this.resultError = false;
    const that = this;
    if (this.educationData) {
      const rest = this.restClient.request('chsiServer', 'collection', 'education',
      { xm: this.educationData['name'], zsbh: this.educationData['certificateNum']});
      rest.then(result => {
        if (result.code === 1) {
          that.showResult = true;
          that.resultError = false;
          that.resultData = result.result.properties;
          const caseId = window.localStorage.getItem('caseId');
          const taskId = '';
          that.currentMatter['id'] = that.currentMatter['vid'];
          that.currentMatter['status'] = 'Success';
          that.currentMatter['type'] = 'Stuff';
          const stuff = that.currentMatter;
          const json = {taskId, caseId, stuff};
          if (json.caseId && json.stuff) {
            that._project.submitMaterialVerif(json);
          } else {
            // that._message.error('')
          }
        } else {
          that.showResult = true;
          that.resultError = true;
          that._message.error('核验失败了!');
          const caseId = window.localStorage.getItem('caseId');
          const taskId = '';
          that.currentMatter['id'] = that.currentMatter['vid'];
          that.currentMatter['status'] = 'Failed';
          that.currentMatter['type'] = 'Stuff';
          const stuff = that.currentMatter;
          const json = {taskId, caseId, stuff};
          if (json.caseId && json.stuff) {
            that._project.submitMaterialVerif(json);
          } else {
            // that._message.error('')
          }
        }
        that.isLoading = false;
      });
      rest.catch(error => {
        that._message.error('查询中心未返回结果');
        that.isLoading = false;
      })
    }
  }
}
