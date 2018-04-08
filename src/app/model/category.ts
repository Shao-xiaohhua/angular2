
export class Category {
    id: string;
    name: string;
    code: string;
    icon: string;
    description: string;
    supportHierarchy: boolean;
    deprecated: boolean;
    disabled = false;
    type: Type;
    mode: Mode;
    children = new Array<Category>();
    constructor(data: {}) {
        this.id = data['id'];
        this.name = data['name'];
        this.code = data['code'];
        this.icon = data['icon'];
        this.description = data['description'];
        this.supportHierarchy = data['supportHierarchy'];
        this.deprecated = data['deprecated'];
        this.disabled = data['disabled'];
        const t = data['type'];
        if ('System' === t) {
            this.type = Type.System;
        } else if ('Custom' === t) {
            this.type = Type.Custom;
        }
        const m = data['mode'];
        if ('Group' === m) {
            this.mode = Mode.Group;
        } else if ('Set' === m) {
            this.mode = Mode.Set;
        } else if ('Element' === m) {
            this.mode = Mode.Element;
        }
        if (data['children'] != null) {
            data['children'].forEach(childData => {
                this.children.push(new Category(childData));
            });
        }
    }
}

export enum Type {
    System,
    Custom
}

export enum Mode {
    Group,
    Set,
    Element
}

