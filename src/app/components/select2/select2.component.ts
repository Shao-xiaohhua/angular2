import { Component, Input, Output, AfterViewInit, ElementRef, EventEmitter, OnChanges, ViewEncapsulation } from '@angular/core';
import { CustomInputComponent, customInputAccessor } from './custom-input';

declare var require: any;
const $ = require('jquery');

import './../../../../node_modules/select2/dist/js/select2.min.js';

@Component({
  selector: 'app-select2',
  template: `<select class="form-control" [(ngModel)]="value" [disabled]="disabled"></select>`,
  styleUrls: ['./../../../../node_modules/select2/dist/css/select2.min.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [customInputAccessor(Select2Component)]
})

export class Select2Component extends CustomInputComponent implements OnChanges, AfterViewInit {
  @Input() options: any[] = []; // object: {id, text} or array: []
  @Input() disabled = false;
  @Output() onSelect = new EventEmitter<any>();

  select2: any;
  private el: ElementRef;

  constructor(el: ElementRef) {
    super();
    this.el = el;
  }

  ngAfterViewInit() {
    this.select2.select2('val', [this.value]);
  }

  ngOnChanges() {
    this.select2 = $(this.el.nativeElement).find('select').select2(this.options).on('select2:select', (ev: any) => {
      const { id, text } = ev['params']['data'];
      this.value = id;
      this.onSelect.emit({ id, text });
    });
  }
}