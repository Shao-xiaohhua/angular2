import { Component, Input, OnChanges, ViewContainerRef, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router'

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { Entity } from '../model/entity';
import { Pagination } from '../model/pagination';
import { Field } from '../model/field';
import { Type } from '../model/type';
import { Business } from '../model/business';
import { ViewInfo, ListView } from '../model/view';
import { MetaLoader } from '../service/meta-loader.service';
import { DataService } from '../service/data.service';
import { RestClient } from '../service/rest-client.service';
import { RendererMeta } from '../service/renderer-meta.service';

import { DataTableTranslations, DataTableParams, DataTable } from 'angular-4-data-table';

@Component({
    selector: 'dm-list',
    templateUrl: './list-renderer.component.html'
})
export class ListRendererComponent implements OnChanges {
    @Input() type: Type;
    @Input() view: ListView;
    @Input() business: Business;
    pagination: Pagination<Entity>;
    actionId: string;
    viewInfo: ViewInfo;
    items = [];
    total = 0;
    pageSize = 10;
    currentSelectedRow: any;
    parentId: string;

    translations = <DataTableTranslations>{
        indexColumn: '索引',
        expandColumn: '展开列',
        selectColumn: '选择列',
        paginationLimit: '分页大小',
        paginationRange: '查询结果'
    };
    @ViewChild('dmGrid') dmGrid: DataTable;
    constructor(private dataService: DataService, private route: ActivatedRoute, public toastr: ToastsManager, vcr: ViewContainerRef,
        private rendererMeta: RendererMeta, private router: Router) {
        this.toastr.setRootViewContainerRef(vcr);
    }

    ngOnChanges() {
        console.log('list renderer changes');
        if (this.business != null) {
            this.type = MetaLoader.loadType(this.business.getTypeName());
            this.viewInfo = this.type.getView(this.business.getView());
            this.view = <ListView>this.viewInfo.definition;
            const actionName = this.business.initAction || 'query';
            const initAction = this.type.getAction(actionName);
            if (initAction == null) {
                this.toastr.error('Init action:' + actionName + ' is not found!', '错误');
            } else {
                this.actionId = initAction.id;
            }
        }
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
            this.items = new Array();
            this.dataService.invoke(this.actionId, paramsObj).then(result => {
                console.log(result);
                this.total = result.total;
                result.items.forEach(item => {
                    let entity = item['properties'];
                    const $displays = item['$displays'];
                    entity = MetaLoader.apply(entity, $displays);
                    entity.id  = item.id;
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
        }else {
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

    rowTooltip(item) { return item.name; }

    executeBusiness(config) {
        const page = this;
        this.rendererMeta.executeBusiness(config, page);
    }

    trash(entityId) {
        const page = this;
        const actionId = this.type.getName() + '@trash';
        if (!entityId) {
            const row = this.getSelectedRow();
            if (row == null) {
                this.toastr.error('请选择一条数据', '错误');
                return;
            }else {
                entityId = row.item.id;
            }
        }
        if (!confirm('您确认要删除吗？')) {
            return;
        }
        this.rendererMeta.executeAction({id: actionId, params: {entityId: entityId}}).then(result => {
            if (result.code === 1) {
                this.toastr.info('删除成功！', '提示');
                this.refresh();
            }else {
                this.toastr.error('删除失败！ code:' + result.code, '错误', { dismiss: 'click' });
            }
        });
    }

    close() {
    }

    refresh() {
        this.dmGrid.reloadItems();
    }

    validatePage() {
        return true;
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
        // if (Ext.Array.contains(typeIds, this.businessData.getType().getParent();
        // && this.businessData.getType().getParent().getId())) { // 当页面传入parentId且选中了一行 以选中的为准
        //     if (row != null) {
        //         parentId = row.getId();
        //     }
        // }
        const params: any = {
            parentId : parentId
        }; // , relationId: this.businessData.relationId};
        if (row) {
            params.entityId = row.item.id;
        }
        return params;
    }

}
