import {
    Component, Input, OnInit, OnChanges, ViewChild, ViewContainerRef, ComponentFactory,
    ComponentRef, ComponentFactoryResolver, OnDestroy, ChangeDetectionStrategy, TemplateRef, ChangeDetectorRef
} from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router'

import { Widget, Fieldset } from '../model/widget';
import { Operation } from '../model/business';
import { DetailRendererService } from '../service/detail-renderer.service';
import { MetaLoader } from '../service/meta-loader.service';
import { RendererMeta } from '../service/renderer-meta.service';
import { DataService } from '../service/data.service';
import { Type } from '../model/type';
import { Business } from '../model/business';
import { Action } from '../model/action';
import { Entity } from '../model/entity';
import { ViewInfo, DetailView, ListView, SearchView, View } from '../model/view';
import { ListRendererComponent } from './list-renderer.component';
import { SearchRendererComponent } from './search-renderer.component';
import { SelectRendererComponent } from './select-renderer.component';

import { environment } from '../../environments/environment';

import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
    selector: 'dm-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './detail-renderer.component.html',
    providers: [DetailRendererService]
})
export class DetailRendererComponent implements OnInit, OnChanges, OnDestroy {

    public tabs: any[] = [];

    fieldsets: Fieldset[] = [];

    form: FormGroup;
    @Input() type: Type;
    @Input() view: DetailView;
    @Input() business: Business;
    @Input() entity: Entity;
    @Input() entityId: string;
    @Input() config: Object = {};
    properties: Object;
    parentId: string;
    relationId: string;
    relationData: Object;
    title: string;
    simpleTitle: string;
    viewInfo: ViewInfo;
    public modalRef: BsModalRef;
    public modalRef2: BsModalRef;
    isWindow: Boolean;
    dialog: any;
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
        private route: ActivatedRoute, private router: Router) {
        this.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        this.interval = setInterval(() => {
                this.changeDetectorRef.markForCheck();
        }, 50);
        if (this.isWindow) {
            MetaLoader.apply(this, this.config);  // 合并参数
        } else if (!this.entityId) {
            this.entityId = this.route.snapshot.queryParams['entityId']
        }
        this.dialogId = 'dialog_' + this.compId;
        if (this.business != null) {
            this.compId = this.business.getName() + new Date().getMilliseconds();
            this.type = MetaLoader.loadType(this.business.getTypeName());
            this.viewInfo = this.type.getView(this.business.getView());
            this.view = <DetailView>this.viewInfo.definition;
            console.log('test>>', this.type, this.viewInfo, this.view)
            this.title = this.business.getTitle();
            if (!this.title) {
                this.title = this.business.getDisplayAs() + this.type.getDisplayAs()
            }
            if (this.entityId) {
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
            if (this.business.getLinks().length > 0) {
                this.business.getLinks().forEach(link => {
                    const array = link.split('@');
                    let linkBusiness = null;
                    let type = this.type;
                    if (array.length === 2) {
                        linkBusiness = MetaLoader.loadBusiness(link);
                        type = MetaLoader.loadType(array[0]);
                    } else {
                        type = this.type;
                        linkBusiness = this.type.getBusiness(link);
                    }
                    if (linkBusiness != null) {
                        // this.tabs.push({
                        //     title: linkBusiness.getTitle() || (linkBusiness.getDisplayAs() + ' - ' + type.getDisplayAs()),
                        //     content: link
                        // });
                    }
                });
            }
        } else {
            this.toastr.error('业务不存在', '错误');
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
        const factory: ComponentFactory<DetailRendererComponent> = this.resolver.resolveComponentFactory(DetailRendererComponent);
        const componentRef: ComponentRef<DetailRendererComponent> = this.container.createComponent(factory);
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
        console.log('changes............', this.view.fieldsets);
        this.fieldsets = [];
        this.view.fieldsets.forEach(delegate => {
            this.fieldsets.push(new Fieldset({
                delegate: delegate,
                type: this.type,
                entity: this.entity
            }));
        });
        this.form = this.detailRendererService.toFormGroup(this.fieldsets);
        console.log('detail init>>>', this.entityId, this.entity);
        if (this.entity != null) {
            this.properties = this.entity.properties;
            this.form.patchValue(this.properties);
        }
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
        return params;
    }

}

