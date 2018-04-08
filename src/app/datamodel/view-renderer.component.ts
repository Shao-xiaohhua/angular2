import {
    Component, Input, OnInit, OnChanges, ViewChild, ViewContainerRef, ComponentFactory,
    ComponentRef, ComponentFactoryResolver, OnDestroy, ChangeDetectionStrategy, TemplateRef, ChangeDetectorRef
} from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router'

import { Widget, Fieldset } from '../model/widget';
import { Operation } from '../model/business';
import { DetailRendererService } from '../service/detail-renderer.service';
import { MetaLoader } from '../service/meta-loader.service';
import { RendererMeta } from '../service/renderer-meta.service';
import { DataService } from '../service/data.service';
import { Type } from '../model/type';
import { Business, RendererType } from '../model/business';
import { Action } from '../model/action';
import { Entity } from '../model/entity';
import { ViewInfo, DetailView, ListView, SearchView, View } from '../model/view';
import { ListRendererComponent } from './list-renderer.component';
import { SearchRendererComponent } from './search-renderer.component';

import { environment } from '../../environments/environment';

import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
    selector: 'dm-view',
    templateUrl: 'view-renderer.component.html',
    providers: [DetailRendererService]
})

export class ViewRendererComponent implements OnInit , OnChanges {
    @Input() view: DetailView;
    @Input() type: Type;
    @Input() business: Business;
    @Input() entity: Entity;
    @Input() entityId: string;
    @Input() config: Object = {};
    title: string;
    simpleTitle: string;
    viewInfo: ViewInfo;
    isWindow: Boolean;
    dialog: any;
    dialogId: string;
    fieldsets: Fieldset[] = [];
    form: FormGroup;
    interval: any;
    compId: string;
    properties: Object;


    @ViewChild('lgModal') public childModal: ModalDirective;
    constructor(
        private detailRendererService: DetailRendererService,
        private dataService: DataService,
        public toastr: ToastsManager,
        vcr: ViewContainerRef,
        private resolver: ComponentFactoryResolver,
        private modalService: BsModalService,
        private changeDetectorRef: ChangeDetectorRef,
        private rendererMeta: RendererMeta,
        private route: ActivatedRoute
    ) {
        this.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        this.interval = setInterval(() => {
            this.changeDetectorRef.markForCheck();
        }, 50);
        if (this.isWindow) {
            MetaLoader.apply(this, this.config);  // 合并参数
        } else {
            this.entityId = this.route.snapshot.queryParams['entityId']
        }
        this.dialogId = 'dialog_' + this.compId;
        this.compId = this.business.getName() + new Date().getMilliseconds();
        // if (this.view == null) {
        //     this.type = MetaLoader.loadType('pims.PetitionTransact');
        //     const view = this.type.getView('detail').definition;
        //     if (view instanceof DetailView) {
        //         const detailView = <DetailView>view;
        //         this.view = detailView;
        //     }
        // }
        // if (this.business.getLinks().length > 0) {
        //     this.business.getLinks().forEach(link => {
        //         const array = link.split('@');
        //         let linkBusiness = null;
        //         let type = this.type;
        //         if (array.length === 2) {
        //             linkBusiness = MetaLoader.loadBusiness(link);
        //             type = MetaLoader.loadType(array[0]);
        //         } else {
        //             type = this.type;
        //             linkBusiness = this.type.getBusiness(link);
        //         }
        //         if (linkBusiness != null) {
        //             // this.tabs.push({
        //             //     title: linkBusiness.getTitle() || (linkBusiness.getDisplayAs() + ' - ' + type.getDisplayAs()),
        //             //     content: link
        //             // });
        //         }
        //     });
        // }
        this.title = this.business.getTitle();
        if (!this.title) {
            this.title = this.business.getDisplayAs() + this.type.getDisplayAs()
        }
        if (this.entityId) {
            const actionId = this.type.getName() + '@compose';
            this.rendererMeta.executeAction({ id: actionId, params: { entityId: this.entityId } }).then(result => {
                if (result == null) {
                    this.toastr.error('实体数据不存在！', '错误', { dismiss: 'click' });
                }
                this.entity = result;
                const displayField = this.type.getDisplayField();
                if (displayField != null) {
                    const entityDisplayAs = this.entity && this.entity.properties[displayField.getName()];
                    if (entityDisplayAs) {
                        this.simpleTitle = entityDisplayAs;
                    }
                }
                this.ngOnChanges();
            });
        }
        this.ngOnChanges();
    }

    ngOnChanges() {
        console.log('changes............', this.view.fieldsets);
        this.fieldsets = [];
        const showDisplayer = this.business.rendererType === RendererType.View;
        this.view.fieldsets.forEach(delegate => {
            this.fieldsets.push(new Fieldset({
                delegate: delegate,
                type: this.type,
                entity: this.entity,
                showDisplayer: showDisplayer
            }));
        });
        this.form = this.detailRendererService.toFormGroup(this.fieldsets);
        console.log('detail init>>>', this.entityId, this.entity);
        if (this.entity != null) {
            this.properties = this.entity.properties;
            this.form.patchValue(this.properties);
        }
    }
    close(template) {
        if (this.isWindow === true && this.childModal) {
            this.childModal.hide();
        }else {
            window.history.back();
        }
    }
}
