import { Component, OnInit, Input, OnChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { ReactiveFormsModule, FormControl, Validators, FormGroup, Form } from '@angular/forms';

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
import { OperationComponent } from './include/operation.component';
@Component({
    selector: 'dm-search',
    templateUrl: 'search-renderer.component.html'
})

export class SearchRendererComponent implements OnChanges {
    @Input() view: SearchView;
    @Input() type: Type;
    @Input() business: Business;
    actionId: string;
    items = [];
    total = 0;
    pageSize = 0;
    form: FormGroup;
    currentSelectedRow: any;
    viewInfo: ViewInfo;
    parentId: string;
    widgets: Array<Widget<any>>;

    translations = <DataTableTranslations>{
        indexColumn: '索引',
        expandColumn: '展开列',
        selectColumn: '选择列',
        paginationLimit: '分页大小',
        paginationRange: '查询结果'
    };
    @ViewChild(OperationComponent)
    private operator: OperationComponent;

    @ViewChild('dmGrid') dmGrid: DataTable;
    constructor(private dataService: DataService, private route: ActivatedRoute, public toastr: ToastsManager, vcr: ViewContainerRef,
        private rendererMeta: RendererMeta, private router: Router) {
        this.toastr.setRootViewContainerRef(vcr);
    }

    ngOnChanges() {
        console.log('searchrender--------business', this.business, this.view, this.viewInfo);
        if (this.business != null) {
            this.type = MetaLoader.loadType(this.business.getTypeName());
            this.viewInfo = this.type.getView(this.business.getView());
            this.view = <SearchView>this.viewInfo.definition;
            const actionName = this.business.initAction || 'query';
            this.viewInfo = this.type.getView(this.business.getView());
            console.log('viewInfo', this.viewInfo);
            const initAction = this.type.getAction(actionName);
            if (initAction == null) {
                this.toastr.error('Init action:' + actionName + ' is not found!', '错误');
            } else {
                this.actionId = initAction.id;
                // this.query({}); // 这里不需要再调用，否则会请求两次，且可能造成渲染累加
            }
            this.pageSize = this.view.pageSize;
            this.buildSearchForm();
            // 重新加载数据
            setTimeout(() => {
                this.operator.checkUpdate();
                this.refresh();
            }, 200);
        }
    }

    buildSearchForm() {
        // process view conditions
        const group: any = [];
        this.widgets = new Array<Widget<any>>();
        if (this.view && this.view.conditions.length > 0) {
            for (let i = 0; i < this.view.conditions.length; i++) {
                const item = this.view.conditions[i];
                const field = this.type.getField(item.field);
                const widget: Widget<any> = new Widget();
                widget.xtype = item.input;
                widget.label = item.label;
                widget.fieldName = item.field;
                widget.required = false;
                widget.schema = field.getSchema();
                widget.array = field.isArray();
                widget.labelWidth = 1;
                widget.inputWidth = 3;
                this.widgets.push(widget);

                group[widget.fieldName] = widget.required ? new FormControl(widget.value || '', Validators.required)
                    : new FormControl(widget.value || '');
            }
        }
        this.form = new FormGroup(group);
    }

    doReset() {
        this.form.reset({});
        this.refresh();
    }

    doSearch() {
        this.refresh();
    }

    getSearchData() {
        const array = [];
        const formValue = this.form.value;
        for (const key in formValue) {
            if (formValue.hasOwnProperty(key)) {
                const value = formValue[key];
                if (value) {
                    array.push({
                        field: key,
                        operator: 'Contains', // TODO 需要运算
                        value: value
                    });
                }
            }
        }
        console.log('formValue', formValue, array);
        return array;
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
            paramsObj['expression'] = this.getSearchData(); // TODO 初始参数、高级查询、表达式的operator都尚未处理
            this.dataService.invoke(this.actionId, paramsObj).then(result => {
                this.items = new Array();
                console.log('result', result);
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
                if (result.total < this.view.pageSize) {
                    this.pageSize = (result.total === 0 ? 1 : result.total);
                }
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
            } else {
                entityId = row.item.id;
            }
        }
        if (!confirm('您确认要删除吗？')) {
            return;
        }
        this.rendererMeta.executeAction({ id: actionId, params: { entityId: entityId } }).then(result => {
            if (result.code === 1) {
                this.toastr.info('删除成功！', '提示');
                this.refresh();
            } else {
                this.toastr.error('删除失败！ code:' + result.code, '错误', { dismiss: 'click' });
            }
        });
    }

    close() {
    }

    refresh() {
        this.dmGrid.reloadItems();
        this.currentSelectedRow = null;
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
