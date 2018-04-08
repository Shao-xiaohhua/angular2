/**
 * https://github.com/select2/select2
 */
import { Component, Input, OnInit, OnChanges, AfterViewInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MetaLoader } from '../../service/meta-loader.service';
import { Widget, WidgetType } from '../../model/widget';
import { Category, Mode as CategoryMode } from '../../model/category';

declare var require: any;
const $ = require('jquery');
import './../../../../node_modules/select2/dist/js/select2.full.js';
@Component({
    selector: 'widget-optioncombo',
    templateUrl: './option-combo.component.html',
    styleUrls: ['./../../../../node_modules/select2/dist/css/select2.min.css'],
    encapsulation: ViewEncapsulation.None
})
export class OptionComboComponent implements AfterViewInit {
    private select2: any;
    public _widget: Widget<any>;
    @Input() form: FormGroup;
    widgetType = WidgetType;

    public options = [];

    @Input() set widget(widget: Widget<any>) {
        this._widget = widget;
    }

    constructor(
        private el: ElementRef
    ) { }

    setValue(value: any) {
        this.form.value[this._widget.fieldName] = value;
    }

    getValue(): any[] {
        const value = this.form.value[this._widget.fieldName];
        if (value instanceof Array) {
            return value;
        } else {
            return new Array(value);
        }
    }

    generateOptionTag(options: Option[], padding?: string) {
        padding = padding || '';
        options.forEach((option, idx, array) => {
            option['data']['padding'] = padding;
            const values = this.getValue();
            if (values && values.indexOf(option['id']) > -1) {
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
        if (this._widget.schema) {
            const schema = this._widget.schema.toString();
            const category: Category = MetaLoader.loadCategorySet(schema);
            if (!this._widget.array) {
                this.generateOptionTag([new Option({ 'id': ' ', 'name': '请选择', 'mode': CategoryMode.Element }, 'id', 'name', 'children')]);
            }
            if (category) {
                this.generateOptionTag(new Option(category, 'id', 'name', 'children').children);
            }
            this.initSelect2(this.options);
        }
    }

    initSelect2(options: any[]) {
        const el = $(this.el.nativeElement).find('select');
        this.select2 = el.select2({
            data: options,
            placeholder: '请选择',
            language: 'zh-CN',
            theme: 'inspinia',
            width: '100%',
            multiple: this._widget.array,
            closeOnSelect: !this._widget.array,
            disabled: this._widget.required,
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

    get isValid() {
        return this.form.controls[this._widget.fieldName].valid;
    }
    get isDirty() {
        return this.form.controls[this._widget.fieldName].dirty;
    }
    get isTouched() {
        return this.form.controls[this._widget.fieldName].touched;
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

