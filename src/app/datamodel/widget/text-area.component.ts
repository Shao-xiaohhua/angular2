import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Widget, WidgetType } from '../../model/widget';

@Component({
    selector: 'widget-textarea',
    templateUrl: './text-area.component.html'
})
export class TextAreaComponent {
    @Input() widget: Widget<any>;
    @Input() form: FormGroup;
    widgetType = WidgetType;

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
