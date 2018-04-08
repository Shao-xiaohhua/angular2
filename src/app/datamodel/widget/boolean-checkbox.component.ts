import { Component, Input, ElementRef, AfterViewInit, OnChanges, } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Widget, WidgetType } from '../../model/widget';


declare var require: any;
const $ = require('jquery');
@Component({
  selector: 'widget-booleancheckbox',
  templateUrl: './boolean-checkbox.component.html',
  styles: [`
    .checkbox-info {
      padding-top: 5px;
      margin-bottom: 0;
      margin-top: 0;
      height: 34px;
    }
  `]
})
export class BooleanCheckboxComponent implements AfterViewInit, OnChanges {
  public _widget: Widget<any>;
  @Input() form: FormGroup;
  widgetType = WidgetType;


  constructor(private el: ElementRef) { }

  @Input() set widget(widget: Widget<any>) {
    this._widget = widget;
    this._widget.inputType = this._widget.inputType || 'checkbox';
  }

  setValue(value: any) {
    this.form.value[this._widget.fieldName] = value;
  }


  ngAfterViewInit() {
    const el = $(this.el.nativeElement).find('#' + this._widget.fieldName);
    el.click(() => {
      this.setValue(el.is(':checked'));
    });
    el.click(this.ngOnChanges());
    this.setValue(this.form.value[this._widget.fieldName]);
  }

  ngOnChanges() {
    const el = $(this.el.nativeElement).find('#' + this._widget.fieldName);
    // console.log('checked', this.form.value[this._widget.fieldName]);
    if (this.form.value[this._widget.fieldName]) {
      el.attr('checked', 'checked');
    } else {
      el.removeAttr('checked');
    }
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
