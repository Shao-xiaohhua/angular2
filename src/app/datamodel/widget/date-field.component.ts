/**
 * https://github.com/vlio20/angular-datepicker
 */
import { Component, Input, OnInit, OnChanges, NgModule, ViewChild, ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Widget, WidgetType } from '../../model/widget';
import * as moment from 'moment';

declare var require: any;
const $ = require('jquery');
@Component({
    selector: 'widget-datefield',
    templateUrl: './date-field.component.html'
})
export class DateFieldComponent implements AfterViewInit, OnChanges {
    public _widget: Widget<any>;
    @Input() form: FormGroup;
    widgetType = WidgetType;

    displayAs: any = '';

    public dpDayPickerConf: any = {
        locale: 'zh-cn',
        userValueType: 'string',
        startView: 2,
        showMultipleYearsNavigation: 'Enabled',
        showGoToCurrent: 'Disabled',
        showTwentyFourHours: 'Enabled',
        multipleYearsNavigateBy: 5 ,
        forceParse: false,
        autoclose: true,
        format: 'YYYY-MM-DD',
        monthFormat: 'YYYY年MM月',
        yearFormat: 'YYYY年',
        monthBtnFormat: 'MM月',
        weekDayFormat: 'dd',
        required: false,
        theme: 'dp-bootstrap',
        mode: 'day',
        appendTo: 'body',
        allowMultiSelect: false,
        isDayDisabledCallback: false
    };


    setValue(value: any) {
        if (value && value instanceof moment && value.format) {
            this.form.value[this._widget.fieldName] = value.format();
            this.displayAs = value.format(this.dpDayPickerConf.format);
            // console.log('date>>', this.displayAs , '|---|', this.form.value[this._widget.fieldName]);
        }
    }

    contains(str: string, seq: string[]) {
        let flag = false;
        if (str) { seq.forEach(s => { flag = flag ? flag : str.indexOf(s) > -1; }); }
        return flag;
    }

    @Input() set widget(widget: Widget<any>) {
        this._widget = widget;
        this.dpDayPickerConf.required = widget.required || this.dpDayPickerConf.required;
        this.dpDayPickerConf.format = widget.format || this.dpDayPickerConf.format;
        if (this.contains(this.dpDayPickerConf.format, ['H', 'h', 's'])) {
            this.dpDayPickerConf.mode = 'time';
            if (this.contains(this.dpDayPickerConf.format, ['Y', 'M', 'D'])) {
                this.dpDayPickerConf.mode = 'daytime';
            }
            if (this.contains(this.dpDayPickerConf.format, ['s'])) {
                this.dpDayPickerConf.showSeconds = 'Enabled';
            }
        }
        if (!this.contains(this.dpDayPickerConf.format, ['D']) && this.contains(this.dpDayPickerConf.format, ['Y'])) {
            this.dpDayPickerConf.mode = 'month';
        }
        this.dpDayPickerConf.required = this._widget.required;
    }

    ngAfterViewInit() {
        $(this.el.nativeElement).find('.' + this.dpDayPickerConf.theme).attr('_ngcontent-c2', '');
    }

    ngOnChanges(event: any) {
        if (!event || !(event instanceof moment)) {
            const value = this.form.value[this._widget.fieldName];
            event = value ? moment(new Date(value), this.dpDayPickerConf.format) : event;
        }
        this.setValue(event);
    }

    constructor(
        private el: ElementRef
    ) {}

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

