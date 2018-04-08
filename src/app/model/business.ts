import { Type } from './type'
import { Mode } from './mode'
import { MetaLoader } from '../service/meta-loader.service';

export class Business {
    id: string;
    name: string;
    view: string;
    typeName: string;
    renderer: string;
    rendererType: RendererType;
    displayAs: string;
    accessScope: AccessScope;
    executor: string;
    initParams: string;
    title: string;
    condition: string;
    content: string;
    system: boolean;
    inherit: boolean;
    portal: boolean;
    override: boolean;
    mode: Mode;
    disabled: boolean;
    initAction: string;
    operations: Array<Operation>;
    links: Array<string>;
    properties: Map<string, Object>;
    constructor(data: {}) {
        this.id = data['id'];
        this.name = data['name'];
        this.view = data['view'];
        this.typeName = data['typeName'];
        this.displayAs = data['displayAs'];
        this.executor = data['executor'];
        this.initParams = data['initParams'];
        this.title = data['title'];
        this.condition = data['condition'];
        this.content = data['content'];
        this.system = data['system'];
        this.inherit = data['inherit'];
        this.portal = data['portal'];
        this.override = data['override'];
        this.disabled = data['disabled'];
        this.initAction = data['initAction'];
        this.links = data['links'] || new Array<String>();
        this.operations = data['operations'] || new Array<Operation>();
        this.properties = data['properties'] || new Map<String, Object>();
        const as = data['accessScope'];
        if ('Default' === as) {
            this.accessScope = AccessScope.Default;
        } else if ('Public' === as) {
            this.accessScope = AccessScope.Public;
        } else if ('Private' === as) {
            this.accessScope = AccessScope.Private;
        } else if ('Protected' === as) {
            this.accessScope = AccessScope.Protected;
        }
        const m = data['mode'];
        if ('Entity' === m) {
            this.mode = Mode.Entity;
        } else if ('Collection' === m) {
            this.mode = Mode.Collection;
        }
        const renderer = data['renderer'];
        this.renderer = renderer;
        if (renderer) {
            if (renderer.indexOf('View') > -1) {
                this.rendererType = RendererType.View;
            } else if (renderer.indexOf('Detail') > -1) {
                this.rendererType = RendererType.Detail;
            } else if (renderer.indexOf('List') > -1) {
                this.rendererType = RendererType.List;
            } else if (renderer.indexOf('Search') > -1) {
                this.rendererType = RendererType.Search;
            }
        }
    }

    getType(): Type {
        return MetaLoader.loadType(this.typeName);
    };

    getId(): string {
        return this.id;
    };

    getName(): string {
        return this.name;
    };

    getDisplayAs(): string {
        return this.displayAs;
    };

    getExecutor(): string {
        return this.executor;
    };

    getRenderer(): string {
        return this.renderer;
    };

    getTypeName(): string {
        return this.id.split('@')[0];
    };

    getView(): string {
        return this.view;
    };

    isOverride(): boolean {
        return this.override;
    };

    isSystem(): boolean {
        return this.system;
    };

    getOperations(): Array<Operation> {
        return this.operations;
    };

    getInitAction(): string {
        return this.initAction;
    };

    getInitParams(): string {
        return this.initParams;
    };

    getContent(): string {
        return this.content;
    };

    getCondition(): string {
        return this.condition;
    };

    getAccessScope(): AccessScope {
        return this.accessScope;
    };

    getTitle(): string {
        return this.title;
    };

    isPortal(): boolean {
        return this.portal;
    };

    getMode(): Mode {
        return this.mode;
    };

    getLinks(): Array<string> {
        return this.links;
    };

    isInherit(): boolean {
        return this.inherit || false;
    };

    getProperties(): Map<string, Object> {
        return this.properties;
    };

    getProperty(propertyName): Object {
        return this.getProperties()[propertyName];
    };
}

export enum AccessScope {
    Default, Public, Private, Protected
}

export enum RendererType {
    List, Search, View, Detail
}

export enum OperationType {
    Business, Action, Script
}

export enum OperationCallback {
    Nothing, Close, Back, Refresh, Script
}

export enum OperationParameter {
    None, PageData, Custom
}

export class Operation {

    name: string;
    title: string;
    type: OperationType;
    content: string;
    condition: string;
    validator: string;
    parameter: OperationParameter;
    params: string;
    callback: OperationCallback;
    onSuccess: string;
    onFailure: string;
    defaultOp: boolean;
    group: string;
    icon: string;
    access: string;
    constructor(data: {}) {
        this.name = data['name'];
        this.title = data['title'];
        this.content = data['content'];
        this.condition = data['condition'];
        this.validator = data['validator'];
        this.params = data['params'];
        this.onSuccess = data['onSuccess'];
        this.onFailure = data['onFailure'];
        this.defaultOp = data['defaultOp'] || false;
        this.group = data['group'];
        this.icon = data['icon'];
        this.access = data['access'];
        const type = data['type'] || OperationType.Business;
        if ('Business' === type) {
            this.type = OperationType.Business;
        } else if ('Action' === type) {
            this.type = OperationType.Action;
        } else if ('Script' === type) {
            this.type = OperationType.Script;
        }
        const parameter = data['parameter'] || OperationParameter.PageData;
        if ('None' === parameter) {
            this.parameter = OperationParameter.None;
        } else if ('PageData' === parameter) {
            this.parameter = OperationParameter.PageData;
        } else if ('Custom' === parameter) {
            this.parameter = OperationParameter.Custom;
        }
        const callback = data['callback'] || OperationCallback.Nothing;
        if ('Nothing' === callback) {
            this.callback = OperationCallback.Nothing;
        } else if ('Close' === callback) {
            this.callback = OperationCallback.Close;
        } else if ('Back' === callback) {
            this.callback = OperationCallback.Back;
        } else if ('Refresh' === callback) {
            this.callback = OperationCallback.Refresh;
        } else if ('Script' === callback) {
            this.callback = OperationCallback.Script;
        }
    }
}
