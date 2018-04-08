/**
 * https://github.com/select2/select2
 */
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, AfterViewInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MetaLoader } from './../../service/meta-loader.service';
import { Widget, WidgetType } from './../../model/widget';
import { Category, Mode as CategoryMode } from './../../model/category';
import { RestClient } from './../../service/rest-client.service';
import { MachineService } from './../../service/machine.service';
declare var require: any;
const $ = require('jquery');
import './../../../../node_modules/select2/dist/js/select2.full.js';
@Component({
    selector: 'widget-casetype',
    templateUrl: './case-type.component.html',
    styleUrls: ['./../../../../node_modules/select2/dist/css/select2.min.css'],
    encapsulation: ViewEncapsulation.None,
    providers: [MachineService]
})
export class CaseTypeComponent implements AfterViewInit, OnInit {
    private select2: any;
    public options = [];
    @Output() event = new EventEmitter<any>();

    constructor(
        private el: ElementRef,
        private machineService: MachineService,
        private restClient: RestClient
    ) { }

    ngOnInit() {
        this.initOptions();
    }

    setValue(value: any) {
        // window.localStorage.setItem('caseTypeId', value);
        this.event.emit(value);
        this.machineService.redirect('guide', null, {caseTypeId: value});
    }


    generateOptionTag(options: Option[], padding?: string) {
        padding = padding || '';
        options.forEach((option, idx, array) => {
            option['data']['padding'] = padding;
            const op = JSON.parse(JSON.stringify(option));
            delete op.children;
            this.options.push(op); // select2 data不支持 Object
            if (option.children && option.children.length > 0) {
                this.generateOptionTag(option.children, padding + '&nbsp;&nbsp;&nbsp;&nbsp;');
            }
        });
    }

    initOptions() {
        const defaultOp = '{"id":"","text":"请选择","disabled":false,"code":"","pinyin":""}';
        this.options.push(JSON.parse(defaultOp));
        this.restClient.request('npm.CaseTypeService', 'collection', 'loadAllCaseType', null).then(result => {
            const infos = result['result'];
            console.log('loadAllCaseType', result);
            if (infos && infos instanceof Array) {
                this.generateOptionTag(new Option({ 'children': infos }, 'id', 'name', 'children').children);
            }
            this.initSelect2(this.options);
        });
    }

    initSelect2(options: any[]) {
        const el = $(this.el.nativeElement).find('select');
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
                if (!sq) {
                    sq = data.code.match(re);
                }
                if (!sq) {
                    sq = data.pinyin.match(re);
                }
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

    ngAfterViewInit() {
        this.initOptions();
    }

}

export class Option {
    id: string;
    text: string;
    code: string;
    pinyin: string;
    children: Array<Option>;
    data: any;
    constructor(data: {}, id: string, text: string, children: string) {
        this.id = data[id];
        this.text = data[text] + '（' + data['code'] + '）';
        this.code = data['code'];
        this.pinyin = data['pinyin'];
        this.data = data;
        if ('Element' !== data['mode']) {
            this['disabled'] = true;
        } else if (data['disabled']) {
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

