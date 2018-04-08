import {
    Component, Input, OnInit, OnChanges, ViewChild, ViewContainerRef,
    AfterViewInit, ViewEncapsulation, ElementRef, ComponentFactory,
    ComponentRef, ComponentFactoryResolver, OnDestroy,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MetaLoader } from '../../service/meta-loader.service';
import { DataService } from '../../service/data.service';
import { Widget, WidgetType } from '../../model/widget';
import { SelectRendererComponent } from '../select-renderer.component';
import { RestClient } from './../../service/rest-client.service';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

declare var require: any;
const $ = require('jquery');
@Component({
    selector: 'widget-entityfield',
    templateUrl: './entity-field.component.html',
    encapsulation: ViewEncapsulation.None
})
export class EntityFieldComponent implements AfterViewInit {
    public _widget: Widget<any>;
    @Input() form: FormGroup;
    selectRef: ComponentRef<any>;
    entityList: any = [];
    array: Boolean = false;

    widgetType = WidgetType;

    @Input() set widget(widget: Widget<any>) {
        this._widget = widget;
        this.array = widget.array || false;
    }

    @ViewChild('selectContainer', { read: ViewContainerRef }) selectContainer: ViewContainerRef;

    constructor(
        private el: ElementRef,
        public toastr: ToastsManager,
        private vcr: ViewContainerRef,
        private dataService: DataService,
        private restClient: RestClient,
        private resolver: ComponentFactoryResolver
    ) { }

    ngAfterViewInit() {
        this.loadData(this.getValue());
    }

    loadData(ids) {
        const page = this;
        if (!ids) {
            return;
        }
        if (!(ids instanceof Array)) {
            ids = [ids];
        }
        this.restClient.request('dm.Entity', 'collection', 'listSimpleByIds', { ids: ids, typeId: this._widget.schema }).then(result => {
            page.entityList = result;
            console.log('loadData...', result);
        });
    }

    setValue(value: any) {
        if (value && value.length > 0) {
            if (this.array === true) {
                if (!(value instanceof Array)) {
                    value = [value];
                }
                this.loadData(value);
            } else {
                if (value instanceof Array) {
                    value = value[0];
                }
                this.loadData([value]);
            }
        } else {
            if (this.array === true) {
                value = [];
            } else {
                value = null;
            }
            this.entityList = [];
        }
        this.form.value[this._widget.fieldName] = value;
    }

    private getIdsByEntityList() {
        const ids = [];
        if (this.entityList.length !== 0) {
            for (let i = 0; i < this.entityList.length; i++) {
                const entity = this.entityList[i];
                ids.push(entity.id);
            }
        }
        return ids;
    }

    getValue(): any[] {
        const value = this.form.value[this._widget.fieldName];
        if (this.array === true) {
            if (value instanceof Array) {
                return value;
            } else {
                return new Array(value);
            }
        } else {
            if (value instanceof Array) {
                return value[0];
            } else {
                return value;
            }
        }
    }


    createSelectComponent(biz) {
        const factory: ComponentFactory<SelectRendererComponent> = this.resolver.resolveComponentFactory(SelectRendererComponent);
        const componentRef: ComponentRef<SelectRendererComponent> = this.selectContainer.createComponent(factory);
        componentRef.instance.business = biz;
        return componentRef;
    }

    destroyComponent() {
        if (this.selectRef != null) {
            this.selectRef.destroy();
        }
    }

    doSelectEntity() {
        console.log('doSelectEntity........');
        this.destroyComponent();
        const page = this;
        if (this._widget.schema) {
            const schema = this._widget.schema.toString();
            const type = MetaLoader.loadType(schema);
            if (type == null) {
                alert('schema未指定或类型不存在');
                return;
            }
            const biz = MetaLoader.loadBusiness(type.getName() + '@select');
            this.selectRef = this.createSelectComponent(biz);
            if (this.selectRef != null) {
                this.selectRef.instance.isWindow = true;
                this.selectRef.instance.isMulti = this.array === true;
                this.selectRef.instance.callback = function (result) {
                    page.processData(result);
                    console.log('this is select renderer callback...............', result);
                    if (page.selectRef.instance.isWindow === true && page.selectRef.instance.selectModal) {
                        page.selectRef.instance.selectModal.hide();
                    } else {
                        window.history.back();
                    }
                };
                this.selectRef.instance.ngOnChanges();
            }
        }
    }

    processData(result) {
        const me = this;
        let rs = [];
        if (result) {
            if (result instanceof Array) {
                rs = result;
            } else {
                rs = [result]
            }
        }
        if (rs && rs.length > 0) {
            const hasEntities = me.entityList;
            const ids = [];
            for (let i = 0; i < rs.length; i++) {
                const r = rs[i];
                let exists = false;
                if (me.entityList.length > 0) {
                    for (let k = 0; k < hasEntities.length; k++) {
                        if (hasEntities[k].id === r.id) {
                            exists = true;
                            continue;
                        }
                    }
                }
                if (exists) {
                    this.toastr.warning('选择中重复的数据已被忽略!', '提示');
                } else {
                    me.addValue(r.id);
                }
            }
        }
    }

    addValue(value) {
        if (this.array === true) {
            if (value instanceof Array) {
                this.setValue(value);
            } else {
                const ids = this.getValue();
                ids.push(value);
                this.setValue(ids);
            }
        } else {
            this.setValue(value);
        }
    }

    removeEntity(id) {
        const list = [];
        if (this.entityList.length === 0) {
            return;
        }
        for (let i = 0; i < this.entityList.length; i++) {
            const entity = this.entityList[i];
            if (entity.id !== id) {
                list.push(entity);
            }
        }
        this.entityList = list;
        this.setValue(this.getIdsByEntityList());
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
