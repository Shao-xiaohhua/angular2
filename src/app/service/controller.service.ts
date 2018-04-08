import { Injectable } from '@angular/core';

import { DataService } from './data.service';

import { Business } from '../model/business';

@Injectable()
export class Controller {

    // executeBusiness(config) {
	// 	config = config || {};
	// 	// 根据 business 的 viewRenderer 的类型，分别处理渲染的逻辑
	// 	var businessData = config.businessData;
	// 	if (businessData == null) {
	// 		if (config.id != null) {
	// 			businessData = MetaLoader.loadBusiness(config.id);
	// 		} else if (config.typeName && config.businessName) {
	// 			businessData = MetaLoader.loadBusiness(config.typeName + '@' + config.businessName);
	// 		} else if (config.typeId && config.businessName) {
	// 			businessData = MetaLoader.loadType(config.typeId).getBusiness(config.businessName);
	// 		}
	// 	} else {
	// 		if (!businessData.getId) {
	// 			var type = MetaLoader.loadType(businessData.typeId);
	// 			businessData = type.getBusiness(businessData.name);
	// 		}
	// 	}
	// 	if (businessData == null) {
	// 		Class.forName('Ext.ux.TipBox').error('执行失败', '没有找到相关的业务定义!');
	// 		return;
	// 	}
	// 	/*if(!this.checkCurrentUserBusinessExecutePermission(businessData.getId())){
	// 		Class.forName('Ext.ux.TipBox').error('执行失败', '您没有执行该业务的权限!');
	// 		return;
	// 	}*/
	// 	if (businessData.getMode() == 'Entity') {
	// 		if (!config.entityData && config.entityId) {
	// 			config.entityData = this.dataModel.getEntity(config.entityId);
	// 		}
	// 		if (config.entityData == null) {
	// 			Class.forName('Ext.ux.TipBox').error('执行失败', '实体业务没有指定 entityData 或 entityId 或对象未找到．');
	// 			return;
	// 		}
	// 		businessData = MetaLoader.loadType(config.entityData.typeId).getBusiness(businessData.getName());
	// 	}
	// 	return Class.forName(businessData.getExecutor()).execute(businessData, config);
    // };

//     doExecuteBusiness : function(business, params, callback) {
// 		var page = this;
// 		var ok = this.controller.checkEntityGrants(business.getId(), params.entityId);
// 		if (ok == false) {
// 			alert('您没有执行该业务功能的权限！');
// 			return;
// 		}
// 		if (business.getMode() == 'Entity' && params.entityId == null) {
// 			alert('没有指定 Entity 对象！');
// 			return;
// 		}
// 		if (this.fireEvent('beforeexecutebusiness', this, business, params, callback) === false) {
// 			return;
// 		}
// 		if (business.getMode() == 'Entity') {
// 			var c = this.checkBusinessExecutable(business, params.entityId);
// 			if (c == false) {
// 				return;
// 			} else if (Ext.isString(c) && c != '') {
// 				alert('不能执行,原因:' + c);
// 				return;
// 			}
// 		}
// 		var typeIds = [];
// 		var typeData = this.businessData.getType();
// 		while (typeData) {
// 			typeIds.push(typeData.getId());
// 			typeData = typeData.getSuper();
// 		}
// 		var parentId = null;
// 		if (business.getMode() == 'Collection') {
// 			delete params.entityId;
// 			if (this.parentId) {
// 				parentId = this.parentId;
// 			}
// //			 当页面传入parentId且选中了一行 以选中的为准
// 			 if (Ext.Array.contains(typeIds, business.getType().getId())) {
// 				 parentId = params.parentId;
// 			 }
// 		}
// 		var config = {
// 			id : business.getId(),
// 			entityId : params.entityId,
// 			parentId : parentId,
// 			relationId : page.relationData && page.relationData.id,
// 			relationField : page.relationField && page.relationField.getName(),
// 			params : params,
// 			callback : callback,
// 			opener : this
// 		};
// 		this.controller.executeBusiness(config);
// 	},

    executeAction(config: {}) {

    }
}
