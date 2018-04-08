import {
    Component, Output, Input, OnInit, OnChanges, ViewChild, ViewContainerRef, ComponentFactory,
    ComponentRef, ComponentFactoryResolver, OnDestroy, ChangeDetectionStrategy, TemplateRef, ChangeDetectorRef, EventEmitter
} from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router'


import { Fieldset as ViewSet, FieldItem as ViewItem } from 'app/model/view';
import { Widget, Fieldset } from 'app/model/widget';
import { Field } from 'app/model/field';
import { Operation } from 'app/model/business';
import { DetailRendererService } from 'app/service/detail-renderer.service';
import { MetaLoader } from 'app/service/meta-loader.service';
import { RendererMeta } from 'app/service/renderer-meta.service';
import { DataService } from 'app/service/data.service';
import { Type } from 'app/model/type';
import { Business } from 'app/model/business';
import { Action } from 'app/model/action';
import { Entity } from 'app/model/entity';
import { ViewInfo, DetailView, ListView, SearchView, View } from 'app/model/view';
import { ListRendererComponent } from 'app/datamodel/list-renderer.component';
import { SearchRendererComponent } from 'app/datamodel/search-renderer.component';
import { SelectRendererComponent } from 'app/datamodel/select-renderer.component';

import { environment } from 'environments/environment';

import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
    selector: 'widget-variable',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './variable.component.html',
    providers: [DetailRendererService]
})
export class VariableComponent implements OnInit, OnChanges, OnDestroy {


    typeId: string;
    fieldNames: string[];
    entityId: string;
    @Input() config: Object = {};
    @Input() set setTypeId(typeId: string) {
        this.typeId = typeId;
        this.ngOnInit();
    }
    @Input() set setEntityId(entityId: string) {
        this.entityId = entityId;
        this.ngOnInit();
    }
    @Input() set setFieldNames(fieldNames: string[]) {
        this.fieldNames = fieldNames;
        this.ngOnInit();
    }
    @Output() formValues = new EventEmitter();

    public tabs: any[] = [];

    fieldsets: Fieldset[] = [];

    form: FormGroup;

    type: Type;
    entity: Entity;
    properties: Object;
    parentId: string;
    simpleTitle: string;
    isWindow: Boolean;
    dialogId: string;
    interval: any;
    compId: string;


    selectRef: ComponentRef<any>;
    componentRefs: ComponentRef<any> [] = [];

    @ViewChild('linkComponent', { read: ViewContainerRef }) container: ViewContainerRef;
    @ViewChild('selectContainer', { read: ViewContainerRef }) selectContainer: ViewContainerRef;
    @ViewChild('defaultModal') public defaultModal: ModalDirective;
    @ViewChild('selectModal') public selectModal: ModalDirective;
    constructor(private detailRendererService: DetailRendererService, private dataService: DataService,
        public toastr: ToastsManager, vcr: ViewContainerRef, private resolver: ComponentFactoryResolver,
        private modalService: BsModalService, private changeDetectorRef: ChangeDetectorRef, private rendererMeta: RendererMeta,
        private route: ActivatedRoute) {
        this.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        this.interval = setInterval(() => {
                this.changeDetectorRef.markForCheck();
        }, 50);
        this.dialogId = 'dialog_' + this.compId;
        this.compId = '' + new Date().getMilliseconds();
        this.type = MetaLoader.loadType(this.typeId);
        if (this.entityId && this.type) {
            const actionId = this.type.getName() + '@compose';
            this.rendererMeta.executeAction({id: actionId, params: {entityId: this.entityId}}).then(result => {
                if (result == null) {
                    this.toastr.error('实体数据不存在！', '错误', { dismiss: 'click' });
                }
                this.entity = result;
                const displayField = this.type.getDisplayField();
                if (displayField != null) {
                    const entityDisplayAs = this.entity && this.entity.properties[displayField.getName()];
                    if (entityDisplayAs) {
                        this.simpleTitle =  entityDisplayAs;
                    }
                }
                this.ngOnChanges();
            });
        }
        this.ngOnChanges();
    }

    processRelation() {
        // TODO
    }

    createComponent(businessId: string) {
        const biz = MetaLoader.loadBusiness(businessId);
        const type = MetaLoader.loadType(biz.getTypeName());
        const view = type.getView(biz.getView()).definition;
        let componentRef = null;
        if (view instanceof ListView) {
            componentRef = this.createListComponent(type, biz, <ListView> view);
        }else if (biz.getRenderer() === 'com.homolo.datamodel.ui.page.renderers.SelectRenderer') {
            componentRef = this.createSelectComponent(biz);
        }else if (view instanceof SearchView) {
            componentRef = this.createSearchComponent(type, biz, <SearchView> view);
        }else if (view instanceof DetailView) {
            componentRef = this.createDetailComponent(type, biz, <DetailView> view);
        }
        if (componentRef != null) {
            componentRef.instance.isWindow = true;
            componentRef.instance.ngOnChanges();
            this.componentRefs.push(componentRef);
        }
        return null;
    }

    destroyComponent() {
        if (this.componentRefs != null && this.componentRefs.length > 0) {
            this.componentRefs.forEach(ref => {
                ref.destroy();
            });
        }
    }

    createListComponent(type, biz, view) {
        const factory: ComponentFactory<ListRendererComponent> = this.resolver.resolveComponentFactory(ListRendererComponent);
        const componentRef: ComponentRef<ListRendererComponent> = this.container.createComponent(factory);
        componentRef.instance.type = type;
        componentRef.instance.business = biz;
        componentRef.instance.view = view;
        componentRef.instance.pageSize = 5;
        return componentRef;
    }

    createSearchComponent(type, biz, view) {
        const factory: ComponentFactory<SearchRendererComponent> = this.resolver.resolveComponentFactory(SearchRendererComponent);
        const componentRef: ComponentRef<SearchRendererComponent> = this.container.createComponent(factory);
        componentRef.instance.type = type;
        componentRef.instance.business = biz;
        componentRef.instance.view = view;
        return componentRef;
    }

    createSelectComponent(biz) {
        const factory: ComponentFactory<SelectRendererComponent> = this.resolver.resolveComponentFactory(SelectRendererComponent);
        const componentRef: ComponentRef<SelectRendererComponent> = this.selectContainer.createComponent(factory);
        componentRef.instance.config = {
            business: biz
        };
        return componentRef;
    }

    createDetailComponent(type, biz, view) {
        const factory: ComponentFactory<VariableComponent> = this.resolver.resolveComponentFactory(VariableComponent);
        const componentRef: ComponentRef<VariableComponent> = this.container.createComponent(factory);
        componentRef.instance.config = {
            business: biz,
            entityId: this.entityId, // 测试用 TODO
            defaultModal : this.defaultModal // 此处启用页面只能弹一个modal窗口,好处是可以用代码控制关闭
        };
        return componentRef;
    }

    ngOnDestroy() {
        this.destroyComponent();
    }
    public openModal() {
        this.defaultModal.show();
        this.defaultModal.config.ignoreBackdropClick = true;
        this.destroyComponent();
        this.createComponent(this.type.getName() + '@edit');
    }

    public openSelector1() {
        this.selectModal.show();
        this.selectModal.config.ignoreBackdropClick = true;
        this.destroyComponent();
        const biz = MetaLoader.loadBusiness(this.type.getName() + '@select');
        this.selectRef = this.createSelectComponent(biz);
        if (this.selectRef != null) {
            this.selectRef.instance.isWindow = true;
            this.selectRef.instance.callback = function(r){
                console.log('this is select renderer callback...............', r);
            };
            this.selectRef.instance.ngOnChanges();
            this.componentRefs.push(this.selectRef);
        }
    }

    public openSelector() {
        this.destroyComponent();
        const biz = MetaLoader.loadBusiness(this.type.getName() + '@select');
        this.selectRef = this.createSelectComponent(biz);
        if (this.selectRef != null) {
            this.selectRef.instance.isWindow = true;
            this.selectRef.instance.callback = function(r){
                console.log('this is select renderer callback...............', r);
            };
            this.selectRef.instance.ngOnChanges();
            this.componentRefs.push(this.selectRef);
        }
    }

    public closeModal() {
        this.defaultModal.hide();
    }

    public doConfirm () {
        this.selectRef.instance.doConfirm();
        // this.selectModal.hide();
    }

    public alertMe(): void {
        setTimeout(function (): void {
            alert('You\'ve selected the alert tab!');
        });
    }

    ngOnChanges() {
        console.log('changes............');
        this.fieldsets = [];
        const fields: Field[] = [];
        if (this.type && this.fieldNames && this.fieldNames.length > 0) {
            this.fieldNames.forEach(fieldName => {
                const field = this.type.getField(fieldName);
                if (field) {
                    fields.push(field);
                }
            });
        }
        if (fields && fields.length > 0 && this.type) {
            const celNum = fields.length >= 3 ? 3 : 2;
            const viewItems: ViewItem[] = [];
            let index = 0;
            let row = 0;
            let col = 0;
            fields.forEach(field => {
                if (field) {
                    field = JSON.parse(JSON.stringify(field));
                    field['field'] = field['name'];
                    field['row'] = row;
                    field['col'] = col;
                    viewItems.push(new ViewItem(field));
                    index++;
                    col++;
                    if (index % celNum === 0) {
                        row++;
                        col = 0;
                    }
                }
            });
            const viewSet: ViewSet = new ViewSet({
                'items': viewItems,
                'layout': celNum === 2 ? '1:1' : '1:1:1'
            });
            this.fieldsets.push(new Fieldset({
                delegate: viewSet,
                type: this.type,
                entity: this.entity
            }));
            console.log('init fieldsets-->', this.fieldNames, viewSet, this.fieldsets);
        }
        this.form = this.detailRendererService.toFormGroup(this.fieldsets);
        /*console.log('detail init>>>', this.entityId, this.entity);*/
        if (this.entity != null) {
            this.properties = this.entity.properties;
            this.form.patchValue(this.properties);
        }

        this.form.valueChanges.subscribe(value => {
            this.formValues.emit(value);
        });
    }

    onReset() {
        this.form.reset(this.properties);
    }

    onSubmit() {
        this.properties = this.getPageData();
    }

    executeBusiness(config) {
        const page = this;
        this.rendererMeta.executeBusiness(config, page);
    }

    close() {
        if (this.isWindow === true && this.defaultModal) {
            this.defaultModal.hide();
        }else {
            window.history.back();
        }
    }

    refresh() {
        console.log('do... refresh');
    }

    validatePage() {
        return true;
    }

    getPageData() {
        const params: any = {
            javaClass : 'com.homolo.datamodel.domain.Entity',
            typeId : this.type.getId()
        };
        params.properties = this.form.value;
        const parentId = params.properties.parentId;
        delete params.properties.parentId;
        if (this.entity && this.entity.id) {
            params.entityId = this.entity.id;
        }
        if (this.parentId) {
            params.parentId = this.parentId;
        } else if (parentId) {
            params.parentId = parentId;
        }
        // TODO relation\ parentId\ callback
        /*console.log('params--!@#!->', params);*/
        return params;
    }

}

