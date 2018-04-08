/**
 * https://github.com/cipchk/ngx-address
 */
import { Component, Input, OnInit, OnChanges, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Widget, WidgetType } from '../../model/widget';
import { AddressDataChinaService } from 'ngx-address/data/china';
import { AddressComponent } from 'ngx-address';
import { DataType } from 'ngx-address/components/interfaces/data-type';
import { Observable } from 'rxjs/Observable';

import { RestClient } from './../../service/rest-client.service';

declare var require: any;
const $ = require('jquery');
@Component({
    selector: 'widget-zonecombo',
    templateUrl: './zone-combo.component.html',
    providers: [AddressDataChinaService],
})
export class ZoneComboComponent implements AfterViewInit {
    @ViewChild('full') full: AddressComponent;
    public _widget: Widget<any>;
    @Input() form: FormGroup;
    widgetType = WidgetType;

    isOpen = false;
    zones: Array<any> = [];

    public stan: any = {
        id: '',
        result: {},
        values: [],
        options: {}
    };

    // 'tk.Zone/collection/getNamesbyCodes'

    // @Input() set widget(widget: Widget<any>) {
    //     this._widget = widget;
    //     this.stan.id = this.form.value[this._widget.fieldName];
    //     const schema = this._widget.schema.toString() ? this._widget.schema.toString() : '086';
    //     // const zones = this.restClient.request('tk.Zone', schema, 'tree', { code: schema });
    //     const _this = this;
    //     let cachedMap = {};
    //     _this.stan.options = {
    //         types: _this.china.getTypes(),
    //         jumps: [],
    //         //data: this.china.getData.bind(this.china),
    //         http: (index: number, id: string) => {
    //             return new Observable(function (observer) {
    //                 if (index > 2) {
    //                     observer.next(null);
    //                     observer.complete();
    //                     return;
    //                 }
    //                 id = id ? id : schema;
    //                 let _c = cachedMap[id];
    //                 if (!_c) {
    //                     const zones = _this.restClient.request('tk.Zone', id, 'tree', { code: id });
    //                     zones.then(result => {
    //                         const first: Array<Zone> = new Zone(result, 'code', 'name', 'children')['children'];
    //                         _c = {
    //                             type: DataType.list,
    //                             list: first
    //                         };
    //                         cachedMap[id] = _c;
    //                         observer.next(_c);
    //                         observer.complete();
    //                     });
    //                 } else {
    //                     observer.next(_c);
    //                     observer.complete();
    //                 }
    //             });
    //         },
    //         placeholder: widget.tip,
    //         className: 'form-control',
    //         offset: {
    //             x: 0,
    //             y: 30
    //         }
    //     }
    // }

    @Input() set widget(widget: Widget<any>) {
        this._widget = widget;
        this.stan.id = this.form.value[this._widget.fieldName];
        let schema = this._widget.schema.toString();
        schema = schema ? '086' : schema;
        const zones = this.restClient.request('tk.Zone', schema, 'tree', { code: schema });
        const _this = this;
        zones.then(result => {
            const first: Array<Zone> = new Zone(result, 'code', 'name', 'children').children;
            _this.generateOptionTag(first);
            const cachedMap = {};
            _this.stan.options = {
                types: _this.china.getTypes(),
                jumps: [],
                // data: this.china.getData.bind(this.china),
                data: (index: number, id: string) => {
                    return new Observable(function (observer) {
                        if (index > 2) {
                            observer.next(null);
                            observer.complete();
                            return;
                        }
                        if (!id) {
                            observer.next({
                                type: DataType.list,
                                list: first
                            });
                            observer.complete();
                            return;
                        }
                        let _c = cachedMap[id];
                        if (!_c) {
                            const zone = _this.zones.filter(function (value, i) {
                                return value['id'] === id;
                            });
                            _c = {
                                type: DataType.list,
                                list: zone[0]['children']
                            };
                            cachedMap[id] = _c;
                        }
                        observer.next(_c);
                        observer.complete();
                    });
                },
                placeholder: widget.tip,
                className: 'form-control',
                offset: {
                    x: 0,
                    y: 30
                }
            }
        });

    }

    ngAfterViewInit() {
        const el = $(this.el.nativeElement).find('#' + this._widget.fieldName);
        const overlay = el.find('.ngx-address-overlay');
        el.find('.ngx-address-title').mouseover((e: any) => {
            this.isOpen = false;
        });
        el.find('.ngx-address-title').click((e: any) => {
            if (this.isOpen === false) {
                overlay.show();
                this.full.onOpen();
                this.isOpen = true;
            } else {
                overlay.hide();
                this.full.onClose();
                this.isOpen = false;
            }
        });
    }

    onSelectedZone(evn) {
        setTimeout(() => {
            const values: string[] = [];
            evn.paths.forEach(path => {
                if (path.id) {
                    values.push(path.id);
                }
            });
            if (values.length > 0) {
                if (values[values.length - 1] !== evn.id) {
                    values.push(evn.id);
                }
                this.full._t.setAddress(values);
                this.form.value[this._widget.fieldName] = values[values.length - 1];
                this.stan.values = values;
            }
            // console.log('ngAfterViewInit-result', evn, this.stan);
        }, 20);
    }

    generateOptionTag(options: Zone[]) {
        options.forEach((option, idx, array) => {
            const op = JSON.parse(JSON.stringify(option));
            // delete op.children;
            this.zones.push(op);
            if (option.children && option.children.length > 0) {
                this.generateOptionTag(option.children);
            }
        });
    }

    constructor(
        private china: AddressDataChinaService,
        private el: ElementRef,
        private restClient: RestClient
    ) { }

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


export class Zone {
    id: string;
    name: string;
    children: Array<Zone>;
    data: any;
    constructor(data: {}, id: string, text: string, children: string) {
        this.id = data[id];
        this.name = data[text];
        this.data = data;
        if (data[children] != null) {
            this.children = new Array<Zone>();
            data[children].forEach(childData => {
                // if (childData['name'] === '市辖区' || childData['name'] === '县') {
                //     childData[children].forEach(childData2 => {
                //         this.children.push(new Zone(childData2, id, text, children));
                //     });
                // } else {
                //     this.children.push(new Zone(childData, id, text, children));
                // }
                this.children.push(new Zone(childData, id, text, children));
            });
        }
    }
}
