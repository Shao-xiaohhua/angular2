import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef  } from '@angular/core';
import { ProjectService } from '../../service/project.service';
import { MachineService } from '../../service/machine.service';
import { environment } from '../../../environments/environment';
import { MetaLoader } from 'app/service/meta-loader.service';
import { TabsetComponent } from 'ngx-bootstrap';
import { Category, Mode as CategoryMode } from '../../model/category';
import { RestClient } from '../../service/rest-client.service';
declare var require: any;
const $ = require('jquery');
import './../../../../node_modules/select2/dist/js/select2.full.js';
@Component({
  selector: 'app-add-clients',
  templateUrl: './add-clients.component.html',
  styleUrls: ['./add-clients.component.scss'],
  providers: [RestClient, MachineService]
})
export class AddClientsComponent implements OnInit {

  @ViewChild('staticTabs') staticTabs: TabsetComponent;
  @Input() title: string[];
  @Input() index;
  @Input() allClient;
  @Output() onAddLitigant = new EventEmitter();
  private newClient;
  private isAddClient: boolean;
  private clients;
  private currentClient;
  private highshotId = new Date().getTime();
  private clear: boolean;
  private categoryList: any;
  private hasDataInfo: boolean;
  private select2: any;
  public options = [];
  private isSelect = false;
  private selectValue = '';

  private isReadOver: boolean;

  constructor(
    private _project: ProjectService,
    private machineService: MachineService,
    private restClient: RestClient,
    private el: ElementRef
  ) { }

  ngOnInit() {
    this.isReadOver = false;
    this.hasDataInfo = false;
    this.isAddClient = false;
    this.categoryList = [];
    this.clear = false;
    this.newClient = {
      type: 'Face',
      name: '',
      pinyin: '',
      gender: 'Male',
      idNumber: '',
      photoURL: './assets/images/default-male.png',
      photo: '',
      address: '',
      mobile: '',
      idType: '中国身份证',
      signOffice: '',
      category: this.selectValue,
      status: 'Doing',
      precent: 0,
      role: ''
    }
    this.clients = []
    this.title = ['申请人', '关系人']
    const manageClient = this._project.getProject().litigantData;
    for (let i = 0; i < manageClient.length; i++) {
      for (let j = 0; j < manageClient[i].length; j++) {
        this.clients.push(manageClient[i][j])
      }
    }
    this.initOptions();
  }

  addLitigant(): void {
    this.newClient = {
      type: 'Face',
      name: '',
      pinyin: '',
      gender: 'Male',
      idNumber: '',
      photoURL: '',
      photo: '',
      address: '',
      mobile: '',
      idType: 'IdCard',
      signOffice: '',
      category: this.selectValue,
      status: 'Doing',
      precent: 0,
      role: ''
    }
    this.onAddLitigant.emit();
    this.staticTabs.tabs[0].active = true;
    this.machineService.redirect('read', null, {id: 'xxx'});
  }

  clientChange(): void {
    if (this.newClient.address && this.newClient.mobile && this.newClient.name && this.newClient.idNumber) {
      this.isAddClient = true
    } else {
      this.isAddClient = false
    }
  }

  selectCurrentClient(item): void {
    this.isAddClient = true;
    this.currentClient = item
  }

  addClient(): void {
    const me = this;
    this.hasDataInfo = false;
    if (this.newClient.address && this.newClient.mobile && this.newClient.name && this.newClient.idNumber) {
      if (this.title[this.index] === '申请人') {
        this.newClient.role = 'Applicant'
      } else if (this.title[this.index] === '关系人') {
        this.newClient.role = 'Party'
      }

      // 根据性别调用默认头像
      if (!this.newClient.photo) {
        const male: String = './assets/images/default-male.png',
          female: String = './assets/images/default-female.png';
        (this.newClient.gender === 'Male') ? this.newClient.photoURL = male : this.newClient.photoURL = female
        this._project.getProject().litigantData[this.index].push(this.newClient);
        this._project.getProject().litigants.push(this.newClient);
        this.submitClient();
        this.machineService.redirect('badge', MetaLoader.CURRENT_USER.personId, null);
      } else {
        this.machineService.uploadImage(me.newClient.photo, 'image/jpeg', function(data){
          if (data.error === 0) {
            me.newClient.photoURL = environment.ctxpath + data.url;
            me.newClient.photo = data.fileId;
            me._project.getProject().litigantData[me.index].push(me.newClient);
            me._project.getProject().litigants.push(me.newClient);
            me.submitClient();
          } else {
            // 错误处理
          }
        }, function(){});
      }
    }
  }

  private submitClient (): void {
    this.isAddClient = false;
    const caseId = window.localStorage.getItem('caseId')
    const params = JSON.stringify({
      caseId,
      person: this.newClient
    })
    this._project.addClient(params)
  }

  cancelClient (): void {
    this.isAddClient = false;
    this.hasDataInfo = false;
    this.newClient = {
      type: 'Face',
      name: '',
      pinyin: '',
      gender: 'Male',
      idNumber: '',
      photoURL: '',
      photo: '',
      address: '',
      mobile: '',
      idType: 'IdCard',
      signOffice: '',
      category: this.selectValue,
      status: 'Doing',
      precent: 0,
      role: ''
    }
    this.clear = true;
    this.machineService.redirect('badge', MetaLoader.CURRENT_USER.personId, null);
  }

  readIdCard(data): void {
    if (data) {
      this.isReadOver = true;
      setTimeout(() => {
        this.isReadOver = false;
        this.hasDataInfo = true;
      }, 3000);
      this.newClient['name'] = data.name;
      if (data.gender === '男') {
        this.newClient['gender'] = 'Male';
      }else if (data.gender === '女') {
        this.newClient['gender'] = 'Female';
      }
      let photo = '';
      if (data.photo && !data.photo.startsWith('http')) {
        photo = 'data:image/jpg;base64,' + data.photo;
      }
      this.newClient['photo'] = photo;
      this.newClient['idNumber'] = data.idNumber;
      this.newClient['address'] = data.address;
      this.newClient['signOffice'] = data.signOffice;
      this.restClient.request('nlm.IDCardReadLogService', 'collection', 'addPerson', {person: data}).then(res => {
        if (res.code === 1) {
          this.machineService.redirect('read', null, {id: res.result.id});
        } else {

        }
      })
    } else {
      this.isReadOver = false;
      this.hasDataInfo = false;
    }
  }

  public readCardTab(): void {
    const me = this;
    setTimeout(function (): void {
      me.machineService.redirect('read', null, null);
    });
  }
  public waiteInfoTab(): void {
    const me = this;
    setTimeout(function (): void {
      me.machineService.redirect('badge', MetaLoader.CURRENT_USER.personId, null);
    });
  }

  setValue(value: any) {
    this.newClient.category = value;
}
  generateOptionTag(options: Option[], padding?: string) {
    padding = padding || '';
    options.forEach((option, idx, array) => {
        option['data']['padding'] = padding;
        if (!this.isSelect) {
          option['selected'] = true;
          this.selectValue = option.id;
          this.isSelect = true;
        }
        const op = JSON.parse(JSON.stringify(option));
        delete op.children;
        this.options.push(op); // select2 data不支持 Object
        if (option.children && option.children.length > 0) {
            this.generateOptionTag(option.children, padding + '&nbsp;&nbsp;&nbsp;&nbsp;');
        }
    });
}

initOptions() {
  const category: Category = MetaLoader.loadCategorySet('390c1b21d9ff42a99e6ab1f47e47c800');
  if (category) {
    this.generateOptionTag(new Option(category, 'id', 'name', 'children').children);
  }
  this.initSelect2(this.options);
}

initSelect2(options: any[]) {
    const el = $(this.el.nativeElement).find('.category');
    this.select2 = el.select2({
        data: options,
        placeholder: '请选择',
        language: 'zh-CN',
        theme: 'inspinia',
        width: '100%',
        multiple: false,
        closeOnSelect: true,
        disabled: false,
        templateResult: function (item) {
            if (!item.id) { return item.text; }
            const w = item.disabled === true ? 'font-weight:bold' : '';
            const padding = item['data'] && item['data']['padding'] ? item['data']['padding'] : '';
            const tag = [];
            tag.push('<font style="' + w + '">' + padding + item.text + '</font>');
            return $(tag.join(''));
        },
        formatSearching: function () { return $('<font>找不到该选项！</font>'); },
        matcher: function (params, data) {
            if ($.trim(params.term) === '') {
                return data;
            }
            if (typeof data.text === 'undefined') {
                return null;
            }
            const re = new RegExp(params.term, 'gi');
            let sq = data.text.match(re);
            if (sq && sq.length > 0) {
                const modifiedData = $.extend({}, data, true);
                sq = Array.from(new Set(sq));
                sq.forEach(s => {
                    const r = new RegExp(s, 'g');
                    modifiedData.text = modifiedData.text.replace(r, '<em>' + s + '</em>');
                });
                return modifiedData;
            }
            return null;
        }
    });
    this.select2.on('change', (ev: any) => {
        this.setValue(this.select2.val());
    });
  }

}

export class Option {
  id: string;
  text: string;
  children: Array<Option>;
  data: any;
  constructor(data: {}, id: string, text: string, children: string) {
      this.id = data[id];
      this.text = data[text];
      this.data = data;
      if (CategoryMode.Element !== data['mode']) {
          this['disabled'] = true;
      }
      if (data[children] != null) {
          this.children = new Array<Option>();
          data[children].forEach(childData => {
              this.children.push(new Option(childData, id, text, children));
          });
      }
  }
}
