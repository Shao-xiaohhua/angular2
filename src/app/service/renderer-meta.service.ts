import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Type } from '../model/type';
import { Business } from '../model/business';
import { Action } from '../model/action';
import { ViewInfo } from '../model/view';
import { Field } from '../model/field';
import { Module } from '../model/module';
import { Mode } from '../model/mode';
import { RestClient } from './rest-client.service';
import { MetaLoader } from './meta-loader.service';

import { environment } from '../../environments/environment';

@Injectable()
export class RendererMeta {

    ___entity_cache__: {};

    constructor(private restClient: RestClient, private router: Router) {
        console.log('init..........metaloader');
    }

    executeAction(config: any): Promise<any> {
        config = config || {};
        const id = config.id;
        // 根据 business 的 viewRenderer 的类型，分别处理渲染的逻辑
        const params = config.params;
        let actionData: Action = config.actionData;
        if (actionData == null && id != null) {
            actionData = MetaLoader.loadAction(id);
        } else if (config.typeId && config.actionName) {
            actionData = MetaLoader.loadType(config.typeId).getAction(config.actionName);
        } else if (config.typeName && config.actionName) {
            actionData = MetaLoader.loadType(config.typeName).getAction(config.actionName);
        }
        const callback = config.callback;
        return this.restClient.request('dm.DataService', actionData.getId(), 'invoke', params);
    };

    executeBusiness = function (config, page) {
        config = config || {};
        // 根据 business 的 viewRenderer 的类型，分别处理渲染的逻辑
        let businessData = config.businessData;
        if (businessData == null) {
            if (config.id != null) {
                businessData = MetaLoader.loadBusiness(config.id);
            } else if (config.typeName && config.businessName) {
                businessData = MetaLoader.loadBusiness(config.typeName + '@' + config.businessName);
            } else if (config.typeId && config.businessName) {
                businessData = MetaLoader.loadType(config.typeId).getBusiness(config.businessName);
            }
        } else {
            if (!businessData.getId) {
                const type = MetaLoader.loadType(businessData.typeId);
                businessData = type.getBusiness(businessData.name);
            }
        }
        if (businessData == null) {
            page.toastr.error('没有找到相关的业务定义!', '错误', { dismiss: 'click' });
            return;
        }
        if (businessData.getMode() === Mode.Entity) {
            // if (!config.entityData && config.entityId) {
            //     // config.entityData = DataModel.getEntity(config.entityId);
            // }
            // if (!config.entityData) {
            //     page.toastr.error('实体数据不存在！', '错误', { dismiss: 'click' });
            //     return;
            // }
            if (!config.entityId) {
                page.toastr.error('实体数据不存在！', '错误', { dismiss: 'click' });
                return;
            }
        }
        this.executor(businessData, config, page);
    };


    executor(business, config, page) {
        if ('com.homolo.datamodel.ui.executor.JavaScript' === business.getExecutor()) {
            if (!config.entityData && config.entityId) {
                config.entityData = this.getEntity(config.entityId, business.typeName);
            }
            const entity = config.entityData;
            const context = {
                type: MetaLoader.loadType(business.getTypeName()),
                entity: entity,
                config: config,
                returnValue: null
            };
            const callback = config.callback;
            const r = eval('(function(context){' + business.getContent() + '})(context);');
            if (typeof(r) !== 'undefined' && callback) {
                callback(r);
            }
        } else {
            let url = '/business/' + business.getId();
            const paramsStr = this.getQuery(config);
            if (paramsStr) {
                url += '?' + paramsStr
            }
            // window.open(url);
            this.router.navigateByUrl(url, { skipLocationChange: false });
        }

    }

    getEntity(id, typeId) {
        if (!this.___entity_cache__) {
            this.___entity_cache__ = {};
        }
        const cache = this.___entity_cache__;
        const cv = cache[id];
        if (cv != null) {
            const t = new Date().getTime();
            if (t - cv.time < 100) {
                 return cv.entity;
            }
        }
        const entity = this.restClient.request('dm.Entity', id, 'compose', {typeId: typeId});
        console.log('cacheEntity', entity);
        cache[id] = {
            time : new Date().getTime(),
            entity : entity
        };
        return entity;
    };

    getQuery(params) {
        const sb = [];
        if (typeof(params) === 'string') {
            return params;
        }
        for (const name in params) {
            if (params.hasOwnProperty(name)) {
                const v = params[name];
                if (v === null || !v) {
                    continue;
                }
                if (v instanceof Array) {
                    for (let i = 0; i < v.length; i++) {
                        if (sb.length > 0) {
                            sb.push('&');
                        }
                        sb.push(encodeURIComponent(name));
                        sb.push('=');
                        sb.push(encodeURIComponent(v[i]));
                    }
                }else {
                    if (typeof (v) === 'object' || typeof (v) === 'function') {
                        continue;
                    }
                    if (sb.length > 0) {
                        sb.push('&');
                    }
                    sb.push(encodeURIComponent(name));
                    sb.push('=');
                    sb.push(encodeURIComponent(v));
                }
            }
        }
        return sb.join('');
    }



    doExecuteOperation = function (name, entityId, page) {
        const data = page.getPageData();
        const businessData = page.business;
        const operations = businessData.getOperations();
        let operation = null;
        if (operations && operations.length > 0) {
            for (let i = 0; i < operations.length; i++) {
                const op = operations[i];
                if (op.name === name || (name === 'DEFAULT' && op.defaultOp === true)) {
                    operation = op;
                    break;
                }
            }
        }
        if (!operation) {
            if (name === 'DEFAULT') {
                return;
            } else {
                page.toastr.error('操作不存在！', '错误', { dismiss: 'click' });
                return;
            }
        }
        let params = entityId ? {
            entityId: entityId
        } : {};
        if (operation.parameter === 'None') {
            // do nothing
        } else if (operation.parameter === 'PageData') {
            params = MetaLoader.apply(params, page.getPageData(operation));
        } else if (operation.parameter === 'Custom' && operation.params) {
            // tslint:disable-next-line:no-eval
            params = MetaLoader.apply(params, eval('(function(params){ ' + operation.params + '})(params)'));
        }
        if (operation.validator) {
            // tslint:disable-next-line:no-eval
            const vr = eval('(function(params){ ' + operation.validator + '})(params)');
            if (vr === false) {
                return;

            }
        } else if (!page.validatePage(operation)) {
            return;
        }
        const callback = this.createOperationCallback(operation, page);
        if (operation.type === 'Business') {
            const biz = businessData.getType().getBusiness(operation.content);
            if (biz == null) {
                page.toastr.error('Operation business not found!', '错误', { dismiss: 'click' });
                return;
            }
            this.doExecuteBusiness(biz, params, callback, page);
        } else if (operation.type === 'Action') {
            const act = businessData.getType().getAction(operation.content);
            if (act == null) {
                page.toastr.error('Operation action not found!', '错误', { dismiss: 'click' });
                return;
            }
            this.doExecuteAction(act, params, callback, page);
        } else if (operation.type === 'Script') {
            // tslint:disable-next-line:no-eval
            const r = eval('(function(params, callback) { ' + operation.content + '})(params, callback)');
            if (r !== undefined) {
                callback(r);
            }
        } else {
            page.toastr.error('Unknow operation type!', '错误', { dismiss: 'click' });
        }

    }

    doExecuteAction = function(action: Action, params: Object, callback: any, page) {
        this.executeAction({actionData : action, params : params}).then(result => {
            const r = result;
            if (r === null || (r.code != null && r.code !== 1)) {
                callback(false, r, page);
            } else {
                page.changed = true;
                callback(true, r, page);
            }
        });
    }

    doExecuteBusiness = function(business, params, callback, page) {
        // const ok = this.controller.checkEntityGrants(business.getId(), params.entityId);
        // if (ok === false) {
        //     alert('您没有执行该业务功能的权限！');
        //     return;
        // }
        if (business.getMode() === Mode.Entity && params.entityId == null) {
            page.toastr.error('没有指定 Entity 对象！', '错误', { dismiss: 'click' });
            return;
        }
        if (business.getMode() === Mode.Entity) {
            const c = this.checkBusinessExecutable(business, params.entityId);
            if (c === false) {
                return;
            } else if (typeof c === 'string' && c !== '') {
                page.toastr.error('不能执行,原因:' + c, '错误', { dismiss: 'click' });
                return;
            }
        }
        const typeIds = [];
        let typeData: Type = business.getType();
        while (typeData) {
            typeIds.push(typeData.getId());
            typeData = MetaLoader.loadType(typeData.superType)
        }
        let parentId = null;
        if (business.getMode() === Mode.Collection) {
            delete params.entityId;
            if (page.parentId) {
                parentId = page.parentId;
            }
            // 当页面传入parentId且选中了一行 以选中的为准
            if (typeIds.includes(business.getType().getId())) {
                parentId = params.parentId;
            }
        }
        const config = {
            id : business.getId(),
            entityId : params.entityId,
            parentId : parentId,
            relationId : page.relationData && page.relationData.id,
            relationField : page.relationField && page.relationField.getName(),
            params : params,
            callback : callback,
            opener : page
        };
        this.executeBusiness(config, page);
    }

    checkBusinessExecutable = function(business, entity, page) {
        if (!business) {
            return false;
        }
        const condition = business.getCondition() || '';
        if (condition !== '') {
            if (MetaLoader.isString(entity)) {
                entity = page.entity;
            }
            // tslint:disable-next-line:no-eval
            return eval('(function(){ ' + condition + '})()');
        } else {
            return true;
        }
    }


    createOperationCallback(operation, page) {
        return function(r, result) {
            if (operation.callback === 'Close') {
                if (r) {
                    page.close();
                    page.toastr.success('操作已成功', '提示');
                } else {
                    this.printError(operation, result, page);
                }
            } else if (operation.callback === 'Back') {
                if (r) {
                    page.close();
                    page.toastr.success('操作已成功', '提示');
                } else {
                    this.printError(operation, result, page);
                }
            } else if (operation.callback === 'Refresh') {
                if (r) {
                    page.refresh();
                    page.toastr.success('操作已成功', '提示');
                } else {
                    this.printError(operation, result, page);
                }
            } else if (operation.callback === 'Script') {
                if (r) {
                    if (operation.onSuccess) {
                        page.toastr.success('操作已成功', '提示');
                    } else {
                        // tslint:disable-next-line:no-eval
                        eval('(function(result){ ' + operation.onSuccess + '})(result)');
                    }
                } else {
                    if (operation.onFailure) {
                        this.printError(operation, result, page);
                    } else {
                        // tslint:disable-next-line:no-eval
                        eval('(function(result){ ' + operation.onFailure + '})(result)');
                    }
                }
            }
        }
    }

    printError(operation, result, page) {
        const msg = (result && result.description) || '';
        page.toastr.error(operation.name + '失败!' + msg, '错误', { dismiss: 'click' });
    }

}

export function loadMetaData(loader: MetaLoader) {
    return () => loader.load();
}
