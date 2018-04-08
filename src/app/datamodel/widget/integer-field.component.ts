/**
 * https://github.com/istvan-ujjmeszaros/bootstrap-touchspin
 */
import { Component, Input, AfterViewInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Widget, WidgetType } from '../../model/widget';

declare var $: any;
import './../../../../node_modules/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.js';
@Component({
    selector: 'widget-integerfield',
    templateUrl: './integer-field.component.html',
    styleUrls: ['./../../../../node_modules/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.css'],
    encapsulation: ViewEncapsulation.None,
})
export class IntegerFieldComponent implements AfterViewInit {
    @Input() widget: Widget<any>;
    @Input() form: FormGroup;
    widgetType = WidgetType;

    constructor(private el: ElementRef) {}

    ngAfterViewInit() {
        const el = $(this.el.nativeElement).find('#' + this.widget.fieldName);
        el.TouchSpin({
            min: 0,
            max: 2147483647,
            step: 1,
            boostat: 5,
            maxboostedstep: 10
        });
        el.change(() => {
            const val: number = parseInt(el.val(), null);
            this.form.value[this.widget.fieldName] = val;
            el.val(val);
        });
    }

    get isValid() {
        return this.form.controls[this.widget.fieldName].valid;
    }
    get isDirty() {
        return this.form.controls[this.widget.fieldName].dirty;
    }
    get isTouched() {
        return this.form.controls[this.widget.fieldName].touched;
    }
}
