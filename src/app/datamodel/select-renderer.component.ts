import { Component, AfterViewInit, Input, OnChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router'
import { ReactiveFormsModule, FormGroup, Form } from '@angular/forms';

import { DataTableTranslations, DataTableParams, DataTableRow, DataTable } from 'angular-4-data-table';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { Type } from '../model/type';
import { Business } from '../model/business';
import { SearchView, ViewInfo } from '../model/view';
import { MetaLoader } from '../service/meta-loader.service';
import { DataService } from '../service/data.service';
import { RestClient } from '../service/rest-client.service';
import { RendererMeta } from '../service/renderer-meta.service';
import { Widget } from '../model/widget';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'dm-select',
    templateUrl: 'select-renderer.component.html'
})

export class SelectRendererComponent implements AfterViewInit, OnChanges {
    @Input() view: SearchView;
    @Input() type: Type;
    @Input() business: Business;
    actionId: string;
    items = [];
    total = 0;
    pageSize = 5;
    form: FormGroup;
    currentSelectedRow: any;
    viewInfo: ViewInfo;
    selectedRow: DataTableRow;
    parentId: string;
    widgets: Array<Widget<any>>;
    callback: any;
    config: Object = {};
    isWindow: Boolean;
    isMulti: Boolean = false;
    partWord: any;

    translations = <DataTableTranslations>{
        indexColumn: '索引',
        expandColumn: '展开列',
        selectColumn: '选择列',
        paginationLimit: '分页大小',
        paginationRange: '查询结果'
    };
    @ViewChild('selectGrid') dmGrid: DataTable;
    @ViewChild('selectModal') public selectModal: ModalDirective;
    constructor(private dataService: DataService, private route: ActivatedRoute, public toastr: ToastsManager, vcr: ViewContainerRef,
        private rendererMeta: RendererMeta) {
        this.toastr.setRootViewContainerRef(vcr);
    }

    ngAfterViewInit() {
        this.openModal();
    }

    ngOnChanges() {
        console.log('selectrender--------business', this.business, this.view, this.viewInfo);
        if (this.isWindow) {
            MetaLoader.apply(this, this.config);  // 合并参数
        }
        if (this.business != null) {
            this.type = MetaLoader.loadType(this.business.getTypeName());
            this.viewInfo = this.type.getView(this.business.getView());
            this.view = <SearchView>this.viewInfo.definition;
            const actionName = this.business.initAction || 'query';
            this.viewInfo = this.type.getView(this.business.getView());
            console.log('viewInfo', this.viewInfo.refreshable);
            const initAction = this.type.getAction(actionName);
            if (initAction == null) {
                this.toastr.error('Init action:' + actionName + ' is not found!', '错误');
            } else {
                this.actionId = initAction.id;
            }
        }
    }

    doSearch() {
        this.refresh();
    }

    query(params: DataTableParams) {
        if (this.actionId != null) {
            const paramsObj = {};
            if (params.offset != null) {
                paramsObj['start'] = params.offset;
            }
            if (params.limit != null) {
                paramsObj['limit'] = params.limit;
            }
            if (params.sortBy != null) {
                paramsObj['sort'] = params.sortBy;
            }
            if (params.sortAsc != null) {
                paramsObj['dir'] = params.sortAsc ? 'ASC' : 'DESC';
            }
            if (this.partWord) {
                paramsObj['partWord'] = this.partWord;
            }
            this.dataService.invoke(this.actionId, paramsObj).then(result => {
                this.items = new Array();
                console.log(result);
                this.total = result.total;
                result.items.forEach(item => {
                    let entity = item['properties'];
                    const $displays = item['$displays'];
                    entity = MetaLoader.apply(entity, $displays);
                    entity.id = item.id;
                    entity.typeId = item.typeId;
                    entity.dateCreated = item.dateCreated;
                    this.items.push(entity);
                });
            });
        }
    }

    rowClick(rowEvent) {
        if (rowEvent.row.selected === true) {
            this.currentSelectedRow = null;
        } else {
            this.currentSelectedRow = rowEvent.row;
        }
        console.log('Clicked: ' + rowEvent.row.item.name, rowEvent.row.item.id, rowEvent.row.selected);
    }

    rowDoubleClick(rowEvent) {
        console.log('Double clicked: ' + rowEvent.row.item.name + ' ' + rowEvent.row.item.id);
        this.rendererMeta.doExecuteOperation('DEFAULT', rowEvent.row.item.id, this);
    }

    getSelectedRow() {
        return this.currentSelectedRow;
    }

    getSelectedRows() {
        return this.dmGrid.selectedRows;
    }

    rowTooltip(item) { return item.name; }

    executeBusiness(config) {
        const page = this;
        this.rendererMeta.executeBusiness(config, page);
    }


    close() {
        if (this.isWindow === true && this.selectModal) {
            this.selectModal.hide();
        } else {
            window.history.back();
        }
    }
    refresh() {
        this.dmGrid.reloadItems();
    }

    openModal() {
        this.selectModal.config.ignoreBackdropClick = true;
        this.selectModal.toggle();
        this.selectModal.show();
    }

    closeModal() {
        this.selectModal.hide();
    }

    doConfirm() {
        const row = this.getSelectedRow();
        const cb = this.callback;
        if (cb && row) {
            cb(row.item);
        }
        if (!this.isMulti) {
            this.close();
        }
        // const rows = this.getSelectedRows();
        // if (rows == null || rows.length === 0) {
        //     alert('请选择一条数据！');
        //     return;
        // }
        // // if (cb != null) {
        //     const field = this.type.getDisplayField();
        //     const objs = [];
        //     for ( let i = 0; i < rows.length; i++) {
        //         objs.push({
        //             id : rows[i].item.id,
        //             name : rows[i].item[field && field.getName()]
        //         })
        //     }
        //     console.log('select', objs);
        //     // cb(objs);
        // // }
        // this.close();
    }

    getPageData(operation) {
        const row = this.getSelectedRow();
        const typeIds = [];
        let typeData = MetaLoader.loadType(this.business.getTypeName());
        while (typeData) {
            typeIds.push(typeData.getId());
            typeData = MetaLoader.loadType(typeData.superType);
        }
        let parentId = null;
        if (this.parentId) {
            parentId = this.parentId;
        }
        const parentType = MetaLoader.loadType(this.type.getParentTypeName());
        if (parentType) {
            const parentTypeId = parentType.getId();
            if (typeIds.includes(parentTypeId)) { // 当页面传入parentId且选中了一行 以选中的为准
                if (row != null) {
                    parentId = row.getId();
                }
            }
        }
        const params: any = {
            parentId: parentId
        }; // , relationId: this.businessData.relationId};
        if (row) {
            params.entityId = row.item.id;
        }
        return params;
    }
}
