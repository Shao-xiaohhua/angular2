import { Component, OnInit, Input, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { MachineService } from '../../service/machine.service';
import { environment } from '../../../environments/environment';
import { Category, Mode as CategoryMode } from '../../model/category';
import { MetaLoader } from 'app/service/meta-loader.service';
import { RestClient } from '../../service/rest-client.service';
import { NzMessageService } from '../message/nz-message.service';
declare var require: any;
const $ = require('jquery');
import './../../../../node_modules/select2/dist/js/select2.full.js';
@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  providers: [MachineService]
})
export class ClientComponent implements OnInit, AfterViewInit {
  @Input() clientData;
  @Input() isProxyBtn: boolean;
  @Input() isConfigBtn: boolean;
  @Output() onRemoveClient = new EventEmitter();
  private isAddProxy: boolean;
  private proxyInfo;
  private clear: boolean;

  private hasDataInfo: boolean;
  private select1: any;
  private select2: any;
  public options = [];

  constructor(
    private machineService: MachineService,
    private el: ElementRef,
    private restClient: RestClient,
    private _message: NzMessageService
  ) { }

  ngOnInit() {
    this.hasDataInfo = false;
    this.isAddProxy = false;
    this.clear = false;
    this.proxyInfo = {
      type: 'Face',
      mobile: '',
      address: '',
      name: '',
      pinyin: '',
      gender: 'Male',
      idType: 'IdCard',
      idNumber: '',
      signOffice: '',
      category: '',
      role: 'Agent',
      status: 'Doing',
      precent: 0,
      photoURL: '',
      photo: '',
      relation: ''
    }
  }
  ngAfterViewInit() {
    this.initOptions();
    this.initOptions1();
  }
  delProxy(): void {
    const item = this.clientData.proxy;
    if (window.confirm('确认删除' + item.name + '的信息？')) {
      if (item.ref) {
        this.restClient.request('npm.PartyService', 'collection', 'deleteParty', { partyId: item.ref }).then(res => {
          if (res.code && res.code === 1) {
            this._message.success('删除成功！');
          } else {
            this._message.error(res.description);
          }
        });
      }
      delete this.clientData.proxy;
    }
  }

  removeClient(): void {
    this.onRemoveClient.emit()
  }

  clientChange(): void {
    if (this.proxyInfo.address && this.proxyInfo.mobile && this.proxyInfo.name && this.proxyInfo.idNumber) {
      this.isAddProxy = true;
    } else {
      this.isAddProxy = false;
    }
  }

  addProxy(): void {
    const me = this;
    if (this.proxyInfo.address && this.proxyInfo.mobile && this.proxyInfo.name && this.proxyInfo.idNumber) {
      if (!this.proxyInfo.photo) {
        const male: String = './assets/images/default-male.png',
          female: String = './assets/images/default-female.png';
        (this.proxyInfo.gender === 'Male') ? this.proxyInfo.photoURL = male : this.proxyInfo.photoURL = female
        this.clientData.proxy = this.proxyInfo;
      } else {
        this.machineService.uploadImage(me.clientData.proxy.photo, 'image/jpeg', function(data){
          if (data.error === 0) {
            me.clientData.proxy = me.proxyInfo;
            me.clientData.proxy.photoURL = environment.ctxpath + data.url;
            me.clientData.proxy.photo = data.fileId;
          } else {
            // 错误处理
          }
        }, function(){});
      }
    }
  }

  private resetProxyInfo (): void {
    this.hasDataInfo = false;
    this.isAddProxy = false;
    this.proxyInfo = {
      type: 'Face',
      mobile: '',
      address: '',
      name: '',
      pinyin: '',
      gender: 'Male',
      idType: 'IdCard',
      idNumber: '',
      signOffice: '',
      category: '',
      role: 'Agent',
      status: 'Doing',
      precent: 0,
      photoURL: '',
      photo: '',
      relation: ''
    };
  }

  private clearProxyInfo (): void {
    this.hasDataInfo = false;
    this.isAddProxy = false;
    this.clear = true;
    this.proxyInfo = {
      type: 'Face',
      mobile: '',
      address: '',
      name: '',
      pinyin: '',
      gender: 'Male',
      idType: 'IdCard',
      idNumber: '',
      signOffice: '',
      category: '',
      role: 'Agent',
      status: 'Doing',
      precent: 0,
      photoURL: '',
      photo: '',
      relation: ''
    }
  }

  readIdCard(data): void {
    if (data) {
      this.hasDataInfo = true;
      this.proxyInfo['name'] = data.name;
      if (data.gender === '男') {
        this.proxyInfo['gender'] = 'Male';
      } else if (data.gender === '女') {
        this.proxyInfo['gender'] = 'Female';
      }
      let photo = '';
      if (data.photo && !data.photo.startsWith('http')) {
        photo = 'data:image/jpg;base64,' + data.photo;
      }
      this.proxyInfo['photo'] = photo;
      this.proxyInfo['idNumber'] = data.idNumber;
      this.proxyInfo['signOffice'] = data.signOffice;
      this.proxyInfo['address'] = data.address;
    } else {
      this.hasDataInfo = false;
    }
  }
  setValue(value: any) {
    this.clientData.category = value;
  }
  setProxyValue(value: any) {
    this.proxyInfo.category = value;
  }
  generateOptionTag(options: Option[], padding?: string) {
    padding = padding || '';
    options.forEach((option, idx, array) => {
        option['data']['padding'] = padding;
        if (this.clientData.category && this.clientData.category === option['id']) {
          option['selected'] = true;
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
generateOptionTag1(options: Option[], padding?: string) {
  padding = padding || '';
  options.forEach((option, idx, array) => {
      option['data']['padding'] = padding;
      if (this.proxyInfo.category && this.proxyInfo.category === option['id']) {
        option['selected'] = true;
      }
      const op = JSON.parse(JSON.stringify(option));
      delete op.children;
      this.options.push(op); // select2 data不支持 Object
      if (option.children && option.children.length > 0) {
          this.generateOptionTag(option.children, padding + '&nbsp;&nbsp;&nbsp;&nbsp;');
      }
  });
}

initOptions1() {
const category: Category = MetaLoader.loadCategorySet('390c1b21d9ff42a99e6ab1f47e47c800');
if (category) {
  this.generateOptionTag1(new Option(category, 'id', 'name', 'children').children);
}
this.initSelect1(this.options);
}
initSelect1(options: any[]) {
  const el = $(this.el.nativeElement).find('.proxySelect');
  this.select1 = el.select2({
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
  this.select1.on('change', (ev: any) => {
      this.setProxyValue(this.select1.val());
  });
}
initSelect2(options: any[]) {
    const el = $(this.el.nativeElement).find('.partyCategory');
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
