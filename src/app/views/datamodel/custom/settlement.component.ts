import {
    Component, Input, OnInit, OnChanges, ViewChild, ViewContainerRef, ComponentFactory,
    ComponentRef, ComponentFactoryResolver, OnDestroy, ChangeDetectionStrategy, TemplateRef, ChangeDetectorRef
} from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router'

import { Widget, Fieldset } from '../../../model/widget';
import { Operation } from '../../../model/business';
import { DetailRendererService } from '../../../service/detail-renderer.service';
import { MetaLoader } from '../../../service/meta-loader.service';
import { RendererMeta } from '../../../service/renderer-meta.service';
import { DataService } from '../../../service/data.service';
import { Type } from '../../../model/type';
import { Business, RendererType } from '../../../model/business';
import { Action } from '../../../model/action';
import { Entity } from '../../../model/entity';
import { ViewInfo, DetailView, ListView, SearchView, View } from '../../../model/view';

import { environment } from '../../../../environments/environment';

import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { RestClient } from '../../../service/rest-client.service';
@Component({
    selector: 'dm-custom-settlement',
    templateUrl: 'settlement.component.html',
    providers: [DetailRendererService, RestClient]
})

export class SettlementComponent implements OnInit , OnChanges {
    business: Business;
    view: any;
    entityId: string;
    entity: Entity;
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
    cases: any = [];
    detail: any;

    constructor(
        private detailRendererService: DetailRendererService,
        private dataService: DataService,
        public toastr: ToastsManager,
        vcr: ViewContainerRef,
        private resolver: ComponentFactoryResolver,
        private modalService: BsModalService,
        private changeDetectorRef: ChangeDetectorRef,
        private rendererMeta: RendererMeta,
        private route: ActivatedRoute,
        private restClient: RestClient
    ) {
        this.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        this.interval = setInterval(() => {
            this.changeDetectorRef.markForCheck();
        }, 50);
        const businessId = this.route.snapshot.queryParams['id']
        this.business = MetaLoader.loadBusiness(businessId);
        if (this.business == null) {
            this.toastr.error('业务数据不存在！', '错误', { dismiss: 'click' });
            return;
        }
        this.entityId = this.route.snapshot.queryParams['entityId']
        this.title = this.business.getTitle();
        if (!this.title) {
            this.title = this.business.getDisplayAs() + this.business.getType().getDisplayAs()
        }
        if (this.entityId) {
            const actionId = this.business.getType().getName() + '@compose';
            this.rendererMeta.executeAction({ id: actionId, params: { entityId: this.entityId } }).then(result => {
                if (result == null) {
                    this.toastr.error('实体数据不存在！', '错误', { dismiss: 'click' });
                }
                this.entity = result;
                const displayField = this.business.getType().getDisplayField();
                if (displayField != null) {
                    const entityDisplayAs = this.entity && this.entity.properties[displayField.getName()];
                    if (entityDisplayAs) {
                        this.simpleTitle = entityDisplayAs;
                    }
                }
                this.ngOnChanges();
                this.caseInfo();
                this.details();
            });
        }
        // this.ngOnChanges();
    }

    ngOnChanges() {
        this.fieldsets = [];
        const showDisplayer = true;
        this.view = MetaLoader.loadType(this.business.typeName).getView(this.business.view).getDefinition();
        this.view.fieldsets.forEach(delegate => {
            this.fieldsets.push(new Fieldset({
                delegate: delegate,
                type: this.business.getType(),
                entity: this.entity,
                showDisplayer: showDisplayer
            }));
        });
        this.form = this.detailRendererService.toFormGroup(this.fieldsets);
        if (this.entity != null) {
            this.properties = this.entity.properties;
            this.form.patchValue(this.properties);
        }
    }

    caseInfo() {
        this.cases = [];
        const actionId = this.business.getType().getName() + '@queryCases';
        this.rendererMeta.executeAction({ id: actionId, params: { entityId: this.entityId } }).then(result => {
            this.cases = result['items'];
        });
    }

    details() {
        this.detail = null;
        const actionId = this.business.getType().getName() + '@querySettlementDetails';
        this.rendererMeta.executeAction({ id: actionId, params: { entityId: this.entityId } }).then(result => {
            if (result.code === 1) {
                this.detail = result.result;
            } else {
                this.detail = null;
            }
            this.calcTotalMoney();
        });
    }
    addOne(item) {
        if (Number(item.mxTotalAmount) > Number(item.currentAmount)) {
            item.currentAmount ++;
            this.calcTotalMoney();
        }
    }
    reduceOne(item) {
        if (Number(item.currentAmount) > 0) {
            item.currentAmount --;
            this.calcTotalMoney();
        }
    }
    calcTotalMoney() {
        this.detail.amount = 0;
        this.detail.details.map(v => {
            this.detail.amount = Number(this.detail.amount) + Number(v.currentAmount);
        });
    }
    save() {
        let count = 0;
        let isCheck = true;
        this.detail.details.map(v => {
            count += Number(v.currentAmount);
            if (v.currentAmount !== 0 && v.currentAmount !== v.mxTotalAmount) {
                isCheck = false;
            }
        });
        if (count === 0) {
            alert('请填写缴纳金额');
            return;
        }
        if (!isCheck) {
            alert('填写的缴纳金额与对应的金额不等');
            return;
        }
        if (!confirm('当前缴纳金额:￥' + count + ',确定要提交结算单?')) {
            return;
        }
        this.restClient.request('dm.DataService', 'fee.Settlement@updateSettlement', 'invoke', {'settleJson': this.detail}).then(res => {
            if (res.code === 1) {
                console.log(res.result);
                this.close(null);
            } else {
            }
        });
    }
    close(template) {
        window.history.back();
    }
}
