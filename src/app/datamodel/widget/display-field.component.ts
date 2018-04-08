import { Component, Input, OnInit, OnChanges, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Widget, WidgetType } from '../../model/widget';

@Component({
    selector: 'widget-displayfield',
    templateUrl: './display-field.component.html'
})
export class DisplayFieldComponent implements AfterViewInit {
    @Input() widget: Widget<any>;
    @Input() form: FormGroup;
    widgetType = WidgetType;

    ngAfterViewInit() {
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
