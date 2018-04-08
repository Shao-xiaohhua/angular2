import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';

import { Type } from '../model/type';
import { Business } from '../model/business';
import { Action } from '../model/action';
import { ViewInfo } from '../model/view';
import { Field } from '../model/field';
import { Module } from '../model/module';
import { DataType } from '../model/data-type';
import { Category, Mode as CategoryMode } from '../model/category';
import { Menu } from '../model/menu';
import { User } from '../model/user';

import { environment } from '../../environments/environment';
import { NotaryOffice } from '../model/notaryoffice';

@Injectable()
export class MetaLoader {

    static TYPE_MAP = new Map<string, Type>();
    static MODULE_MAP = new Map<string, Module>();
    static CATEGORY_MAP = new Map<string, Category>();
    static DATATYPE_MAP = new Map<string, DataType>();
    static CATEGORY_LIST = new Array<Category>();
    static MENU: Menu;
    static CSRF_TOKEN: string;
    static PUBLIC_KEY: string;
    static CURRENT_USER: User;
    // 设备序列号
    static DEVICE_KEY: string;
    static CURRENT_NOTARYOFFICE: NotaryOffice;

    static loadType(nameOrId: string): Type {
        return this.TYPE_MAP.get(nameOrId);
    }

    static loadBusiness(name: string): Business {
        if (name == null) {
            return null;
        }
        const ss = name.split('@');
        const type = this.loadType(ss[0]);
        return type && type.getBusiness(ss[1]);
    }

    static loadAction(name: string): Action {
        if (name == null) {
            return null;
        }
        const ss = name.split('@');
        const type = this.loadType(ss[0]);
        return type && type.getAction(ss[1]);
    }

    static loadView(name: string): ViewInfo {
        if (name == null) {
            return null;
        }
        const ss = name.split('@');
        const type = this.loadType(ss[0]);
        return type && type.getView(ss[1]);
    }

    static loadFeild(name: string): Field {
        if (name == null) {
            return null;
        }
        const ss = name.split('@');
        const type = this.loadType(ss[0]);
        return type && type.getField(ss[1]);
    }

    static getSuperType(type: Type): Type {
        return type.superType && this.loadType(type.superType);
    }

    static addRootCategory(category: Category): void {
        this.CATEGORY_LIST.push(category);
        this.putCategoryToMap(category);
    }

    // 根据 Set 类型的分类id取对应的分类
    static loadCategorySet(id: string): Category {
        return this.CATEGORY_MAP.get(id);
    }

    static loadDataType(name: string): DataType {
        return this.DATATYPE_MAP.get(name);
    }

    private static putCategoryToMap(category: Category) {
        category.children.forEach(child => {
            this.putCategoryToMap(child);
        });
        this.CATEGORY_MAP.set(category.id, category);
    }

    static hasSuperType(type: Type): boolean {
        return this.getSuperType(type) != null;
    }

    static getParentType(type: Type): Type {
        return type.parentType && this.loadType(type.parentType);
    }

    static hasParentType(type: Type): boolean {
        return this.getParentType(type) != null;
    }

    static loadModule(nameOrId: string): Module {
        return this.MODULE_MAP.get(nameOrId);
    }

    // config里的属性合并到object里
    static apply(object: Object, config: Object): Object {
        if (object && config && typeof config === 'object') {
            // tslint:disable-next-line:forin
            for (const key in config) {
                object[key] = config[key];
            }
        }
        return object;
    }

    static isString(value) {
        return typeof value === 'string';
    }

    static isBoolean(value) {
        return typeof value === 'boolean';
    }

    static getMenu() {
        return this.MENU;
    }

    getResourceURL(module: string, id: string, action: string): string {
        return environment.restServiceUrl + module + '/' + id + '/' + action;
    }

    getCollectionURL(module: string, action: string): string {
        return this.getResourceURL(module, 'collection', action);
    }

    constructor(private http: HttpClient) {
        console.log('init..........metaloader', new Date().getTime());
    }

    public load() {
        const jsonData = {};
        return Promise.all([this.getCollectionURL('dm.Meta', 'metadata'),
        this.getCollectionURL('fw.System', 'key'),
        this.getCollectionURL('fw.System', 'csrf'),
        this.getCollectionURL('tk.Category', 'asynctree'),
        this.getResourceURL('tk.Menu', environment.menuName, 'access'),
        this.getCollectionURL('inm.System', 'notaryoffice'),
        environment.serverUrl + '/api/user/info',
        environment.machineUrl + '/api/backLicenseNumber'
        ].map((url, i) => {
            return new Promise((resolve, reject) => {
                const time = new Date().getTime();
                this.http.get(url).map(res => res).catch((error: any): any => {
                    console.log('load data from:' + url + ' error');
                    resolve(true);
                    return Observable.throw(error || 'Server error');
                }).subscribe((response) => {
                    jsonData['data' + i] = response;
                    resolve(true);
                    console.log('loading success from:' + url, new Date().getTime() - time + 'ms');
                })
            });
        })).then(response => {
            jsonData['data' + 0]['modules'].forEach(moduleData => {
                moduleData['types'].forEach(typeData => {
                    const t = new Type(typeData);
                    MetaLoader.TYPE_MAP.set(t.name, t);
                    MetaLoader.TYPE_MAP.set(t.id, t);
                });
            });
            jsonData['data' + 0]['dataTypes'].forEach(data => {
                const dt = new DataType(data);
                MetaLoader.DATATYPE_MAP.set(dt.name, dt);
            })
            if (1 === jsonData['data' + 1]['code']) {
                MetaLoader.PUBLIC_KEY = jsonData['data' + 1]['result'];
            }
            if (1 === jsonData['data' + 2]['code']) {
                MetaLoader.CSRF_TOKEN = jsonData['data' + 2]['result'];
            }
            jsonData['data' + 3].forEach(categoryData => {
                MetaLoader.addRootCategory(new Category(categoryData));
            });
            if (jsonData['data' + 4]) {
                MetaLoader.MENU = new Menu(jsonData['data' + 4]);
                console.log(jsonData['data' + 4], MetaLoader.MENU);
            }
            if (jsonData['data' + 5]) {
                const notaryoffice = jsonData['data' + 5];
                if (notaryoffice.code === 1) {
                    MetaLoader.CURRENT_NOTARYOFFICE = new NotaryOffice(notaryoffice.result);
                    console.log(MetaLoader.CURRENT_NOTARYOFFICE);
                }
            }
            if (jsonData['data' + 6]) {
                const u = jsonData['data' + 6];
                MetaLoader.CURRENT_USER = new User(u.userId, u.personId, u.userName, u.nickName, u.email, u.avatar, u.mobile, u.anonymous);
            }
            if (jsonData['data' + 7]) {
                console.log(jsonData['data' + 7]);
                const data = jsonData['data' + 7]['data'];
                MetaLoader.DEVICE_KEY = data['number'];
                // 这里判断用户是否登录，未登录跳转到登录页面
                if (MetaLoader.CURRENT_USER == null || MetaLoader.CURRENT_USER.anonymous) {
                    window.location.href = '/#license';
                }
            }else {
                // 这里判断用户是否登录，未登录跳转到登录页面
                if (MetaLoader.CURRENT_USER == null || MetaLoader.CURRENT_USER.anonymous) {
                    window.location.href = '/#login';
                }
            }
        });
    }

}

export function loadMetaData(loader: MetaLoader) {
    console.log('loadMetaData:', new Date().getTime());
    return () => loader.load();
}
