import { Type } from './type';
import { Widget } from './widget';

export class Field {
    id: string;
    name: string;
    displayAs: string;
    description: string;
    dataType: string;
    display: boolean;
    supportFilter: boolean;
    array: boolean;
    inherit: boolean;
    schema: Object;
    format: string;
    validator: string;
    accessScope: string;
    editor: string;
    displayer: string;
    wrapper: string;
    defaultValue: Object;
    override: boolean;
    declared: boolean;
    unique: boolean;
    widget: Widget<Object>;
    properties: Map<string, Object>;

    allowBlank = false;
    readOnly = false;


    constructor(data: Object) {
        this.id = data['id'];
        this.name = data['name'];
        this.displayAs = data['displayAs'];
        this.array = data['array'];
        this.schema = data['schema'];
        this.format = data['format'];
        this.dataType = data['dataType'];
        this.validator = data['validator'];
        this.display = data['display'];
        this.supportFilter = data['supportFilter'];
        this.accessScope = data['accessScope'];
        this.inherit = data['inherit'];
        const widget = data['widget'];
        this.wrapper = data['wrapper'];
        this.defaultValue = data['defaultValue'];
        this.override = data['override'];
        this.declared = data['declared'];
        this.unique = data['unique'];
        this.properties = data['properties'];
        if (widget != null) {
            this.allowBlank = widget['allowBlank'];
            this.readOnly = widget['readOnly'];
            this.editor = widget['editor'];
            this.displayer = widget['displayer'];
        }
    }

    getId(): string {
        return this.id;
    };

    getName(): string {
        return this.name;
    };

    getTypeName(): string {
        return this.id.split('@')[0];
    };

    getDisplayAs(): string {
        return this.displayAs;
    };

    getDescription(): string {
        return this.description;
    };

    isArray(): boolean {
        return this.array;
    };

    getDataType(): string {
        return this.dataType;
    };

    getWrapper(): string {
        return this.wrapper;
    };

    getSchema(): Object {
        return this.schema;
    };

    getAccessScope(): string {
        return this.accessScope;
    };

    getOwnWidget(): Widget<Object> {
        return this.widget;
    };

    getWidget(): Widget<Object> {
        // return this.widget || this.getDataType().getWidget();
        return this.widget;
    };

    getFormat(): string {
        return this.format;
    };

    getValidator(): string {
        return this.validator;
    };

    getDefaultValue(): Object {
        return this.defaultValue;
    };

    isDisplay(): boolean {
        return this.display;
    };

    isUnique(): boolean {
        return this.unique;
    };

    isSupportFilter(): boolean {
        return this.supportFilter;
    };

    isOverride(): boolean {
        return this.override;
    };

    isDeclared(): boolean {
        return this.declared;
    };

    isInherit(): boolean {
        return this.inherit || false;
    };

    getProperties(): Map<string, Object> {
        return this.properties || new Map<string, Object>();
    };

    getProperty(propertyName): Object {
        return this.getProperties()[propertyName];
    };

}
