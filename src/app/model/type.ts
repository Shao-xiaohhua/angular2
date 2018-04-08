import { Field } from './field';
import { Business } from './business';
import { Action } from './action';
import { ViewInfo } from './view';
import { MetaLoader } from '../service/meta-loader.service';

export class Type {
    serialVersionUID: string;
    id: string;
    name: string;
    displayAs: string;
    description: string;
    parentType: string;
    superType: string;
    system: boolean;
    fields = new Array<Field>();
    fieldOwns = new Array<Field>();
    fieldMap = new Map<string, Field>();
    businessMap = new Map<string, Business>();
    businessOwns = new Array<Business>();
    actionMap = new Map<string, Action>();
    actionOwns = new Array<Action>();
    viewMap = new Map<string, ViewInfo>();
    viewOwns = new Array<ViewInfo>();
    properties: Map<string, Object>;

    constructor(jsonData: Object) {
        this.serialVersionUID = jsonData['serialVersionUID'];
        this.id = jsonData['id'];
        this.name = jsonData['name'];
        this.displayAs = jsonData['displayAs'];
        this.description = jsonData['description'];
        this.parentType = jsonData['parentType'];
        this.superType = jsonData['superType'];
        this.properties = jsonData['properties'];
        this.system = jsonData['system'];

        jsonData['fields'].forEach(fieldData => {
            const field = new Field(fieldData);
            this.fields.push(field);
            this.fieldMap.set(field.id, field);
            this.fieldMap.set(field.name, field);
            this.fieldOwns.push(field);
        });

        jsonData['views'].forEach(viewData => {
            const viewInfo = new ViewInfo(viewData['view']);
            this.viewMap.set(viewInfo.name, viewInfo);
            this.viewOwns.push(viewInfo);
        });

        this.businessOwns = [];
        jsonData['businesses'].forEach(businessData => {
            const business = new Business(businessData);
            this.businessMap.set(business.name, business);
            this.businessOwns.push(business);
        });

        jsonData['actions'].forEach(actionData => {
            const action = new Action(actionData);
            this.actionMap.set(action.name, action);
            this.actionOwns.push(action);
        });

    }

    getView(name: string): ViewInfo {
        return this.getViewMap()[name];
    }

    getViewMap = function() {
        this.getViews();
        return this.viewMap;
    };

    getOwnViews() {
        return this.viewOwns;
    };

    getViews = function() {
        if (this.viewList != null) {
            return this.viewList;
        }

        const list = this.viewList = [];
        const map = this.viewMap = {};
        const names = [];
        if (this.getSuper() != null) {
            const os = this.getSuper().getViews();
            for ( let i = 0; i < os.length; i++) {
                const o = os[i];
                const name = o.getName();
                o.id = this.getName() + '@' + name;
                o.inherit = true;
                map[name] = o;
                names.push(name);
            }
        }

        const os = this.getOwnViews();
        for ( let i = 0; i < os.length; i++) {
            const o = os[i];
            const name = o.getName();
            if (!(name in map)) {
                names.push(name);
            }
            map[name] = o;
        }

        for ( let i = 0; i < names.length; i++) {
            list.push(map[names[i]]);
        }
        return list;
    };


    hasParent(): boolean {
        return this.parentType != null;
    }

    getParentTypeName(): string {
        return this.parentType;
    }

    hasSuper(): boolean {
        return !!this.superType;
    };


    getSuperTypeName(): string {
        return this.superType;
    };

    getSuper = function() {
        return this.superType && MetaLoader.loadType(this.superType);
    };

    getField(idOrName: string): Field {
        return this.getFieldMap()[idOrName];
    }

    getFieldMap = function() {
        this.getFields();
        return this.fieldMap;
    };

    getOwnFields = function() {
        return this.fieldOwns;
    };

    getFields = function() {

        if (this.fieldList != null) {
            return this.fieldList;
        }

        const list = this.fieldList = [];
        const map = this.fieldMap = {};

        const names = [];
        if (this.getSuper() != null) {
            const os = this.getSuper().getFields();
            for ( let i = 0; i < os.length; i++) {
                const o = os[i];
                const name = o.getName();
                o.id = this.getName() + '@' + name;
                o.inherit = true;
                map[name] = new Field(o);
                names.push(name);
            }
        }

        const os = this.getOwnFields();
        for ( let i = 0; i < os.length; i++) {
            const o = os[i];
            const name = o.getName();
            if (!(name in map)) {
                names.push(name);
            }
            map[name] = o;
        }

        for ( let i = 0; i < names.length; i++) {
            list.push(map[names[i]]);
        }

        return list;
    };


    getBusinessMap(): Map<string, Business> {
        this.getBusinesses();
        return this.businessMap;
    }

    getBusiness(name: string): Business {
        return this.getBusinessMap()[name];
    }

    getOwnBusinesses() {
        return this.businessOwns;
    }

    getBusinesses = function() {
        if (this.businessList != null) {
            return this.businessList;
        }

        const list = this.businessList = [];
        const map = this.businessMap = {};

        const names = [];
        const sType = this.getSuper();
        if (sType != null) {
            const os = sType.getBusinesses();
            for ( let i = 0; i < os.length; i++) {
                const o = os[i];
                const name = o.getName();
                o.id = this.getName() + '@' + name;
                o.inherit = true;
                const biz = new Business(o);
                map[name] = biz;
                names.push(name);
            }
        }

        const os = this.getOwnBusinesses();
        for ( let i = 0; i < os.length; i++) {
            const o = os[i];
            const name = o.getName();
            if (!(name in map)) {
                names.push(name);
            }
            map[name] = o;
        }

        for ( let i = 0; i < names.length; i++) {
            list.push(map[names[i]]);
        }

        return list;
    };

    getAction(name: string): Action {
        return this.getActionMap()[name];
    }


    getActionMap = function() {
        this.getActions();
        return this.actionMap;
    };

    getOwnActions = function() {
        return this.actionOwns;
    };

    getActions = function() {
        if (this.actionList != null) {
            return this.actionList;
        }

        const list = this.actionList = [];
        const map = this.actionMap = {};

        const names = [];
        if (this.getSuper() != null) {
            const os = this.getSuper().getActions();
            for ( let i = 0; i < os.length; i++) {
                const o = os[i];
                const name = o.getName();
                o.id = this.getName() + '@' + name;
                o.inherit = true;
                map[name] = new Action(o);
                names.push(name);
            }
        }

        const os = this.getOwnActions();
        for ( let i = 0; i < os.length; i++) {
            const o = os[i];
            const name = o.getName();
            if (!(name in map)) {
                names.push(name);
            }
            map[name] = o;
        }

        for ( let i = 0; i < names.length; i++) {
            list.push(map[names[i]]);
        }

        return list;
    };

    getDisplayField(): Field {
        for (let i = 0; i < this.fields.length; i++) {
            const field = this.fields[i];
            if (field.isDisplay() === true) {
                return field;
            }
        }
        return null;
    }

    getSerialVersionUID(): string {
        return this.serialVersionUID;
    };

    getId = function () {
        return this.id;
    };

    getName = function () {
        return this.name;
    };

    getDescription = function () {
        return this.description || '';
    };

    getDisplayAs = function () {
        return this.displayAs;
    };

    isSystem = function () {
        return this.system;
    };

    getProperties = function () {
        return this.properties || {};
    };

    getProperty = function (propertyName) {
        const properties = this.properties || {};
        return properties[propertyName];
    };

    private newFunction() {
        return this.serialVersionUID;
    }
}
