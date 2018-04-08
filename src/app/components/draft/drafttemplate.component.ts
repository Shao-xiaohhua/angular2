/**
 * https://github.com/select2/select2
 */
import { Component, Input, OnInit, OnChanges, AfterViewInit, ViewEncapsulation, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MetaLoader } from './../../service/meta-loader.service';
import { Widget, WidgetType } from './../../model/widget';
import { Category, Mode as CategoryMode } from './../../model/category';
import { RestClient } from './../../service/rest-client.service';

declare var require: any;
const $ = require('jquery');
import './../../../../node_modules/select2/dist/js/select2.full.js';
@Component({
    selector: 'widget-drafttemplate',
    templateUrl: './drafttemplate.component.html',
    styleUrls: ['./../../../../node_modules/select2/dist/css/select2.min.css'],
    encapsulation: ViewEncapsulation.None
})
export class DrafttemplateComponent implements AfterViewInit {
    private select2: any;
    public options = [];
    private isSelect = false;
    constructor(
        private el: ElementRef,
        private restClient: RestClient
    ) { }
    @Output() event = new EventEmitter<any>();
    setValue(value: any) {
        this.event.emit(value);
    }


    generateOptionTag(options: Option[], padding?: string) {
        padding = padding || '';
        options.forEach((option, idx, array) => {
            option['data']['padding'] = padding;
            if (!this.isSelect && option['id']) {
                option['selected'] = true;
                this.setValue(option['id']);
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
        const caseTypeId = window.localStorage.getItem('caseTypeId');
        const defaultOp = '{"id":"","text":"请选择","disabled":false}';
        this.options.push(JSON.parse(defaultOp));
        const params = { caseTypeId: caseTypeId, docType : '98a403e94ac642f29ff223607cac7bfc'};
        this.restClient.request('npm.DocTemplateService', 'collection', 'loadTempList', params).then(res => {
          if (res.code === 1) {
            const infos = res['result'];
            if (infos && infos instanceof Array) {
                this.generateOptionTag(new Option({ 'children': infos }, 'id', 'name', 'children').children);
            }
            this.initSelect2(this.options);
          }
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
    children: Array<Option>;
    data: any;
    constructor(data: {}, id: string, text: string, children: string) {
        this.id = data[id];
        this.text = data[text];
        this.data = data;
        this['disabled'] = false;
        if (data[children] != null) {
            this.children = new Array<Option>();
            data[children].forEach(childData => {
                this.children.push(new Option(childData, id, text, children));
            });
        }
    }
}

