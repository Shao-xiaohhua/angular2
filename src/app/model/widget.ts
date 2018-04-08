import { Fieldset as FieldsetMeta, LabelAlign } from './view';
import { Type } from './type';
import { Field } from './field';
import { DataType } from '../model/data-type';
import { MetaLoader } from '../service/meta-loader.service';
import { Entity } from '../model/entity';

export class Widget<T>{
    typeId: string;
    value: T;
    displayAs: string;
    fieldName: string;
    label: string;
    schema: Object;
    labelWidth: number;
    inputWidth: number;
    required: boolean;
    array: boolean;
    format: string;
    tip: string;
    inputType: string;
    validator: string;
    xtype: string;
    widgetType: WidgetType;
    onChange: string;

    constructor(options: {
        typeId?: string,
        value?: T,
        displayAs?: string,
        fieldName?: string,
        format?: string,
        schema?: Object,
        tip?: string,
        label?: string,
        inputType?: string,
        required?: boolean,
        array?: boolean,
        order?: number,
        labelWidth?: number,
        inputWidth?: number,
        validator?: string,
        xtype?: string,
        widgetType?: WidgetType,
        onChange?: string
    } = {}) {
        this.typeId = options.typeId;
        this.value = options.value;
        this.fieldName = options.fieldName || '';
        this.schema = options.schema || '';
        this.format = options.format || '';
        this.inputType = options.inputType || '';
        this.tip = options.tip || '';
        this.label = options.label || '';
        this.validator = options.validator || '';
        this.labelWidth = options.labelWidth === undefined ? 2 : options.labelWidth;
        this.inputWidth = options.inputWidth === undefined ? 10 : options.inputWidth;
        this.required = !!options.required;
        this.array = !!options.array;
        this.xtype = options.xtype;
        this.widgetType = options.widgetType || WidgetType.TextField;
        this.displayAs = options.displayAs ? options.displayAs : (options.value ? options.value.toString() : '');
        this.onChange = options.onChange;
    }
}

export enum WidgetType {
    TextField, NumberField, DateField
}

export class Fieldset {

    name: string;
    labelAlign: LabelAlign;
    border: boolean;

    widgets = new Array<Widget<any>>();
    // 控件widgets顺序重新排列
    fieldsetsWidgetsHalf (widgets): any {
        const result = [];
        const left = [], right = [];
        const half = Math.ceil(widgets.length / 2);
        for (let j = 0; j < half; j++) {
            if (widgets[j]) {left.push(widgets[j])};
        }
        for (let j = half; j < widgets.length; j++) {
            if (widgets[j]) {right.push(widgets[j])};
        }
        const length = left.length > right.length ? left.length : right.length;
        for (let j = 0; j < length; j++) {
            if (left[j]) {result.push(left[j])};
            if (right[j]) {result.push(right[j])};
        }
        return result;
    }
    fieldsetsWidgetsThird (widgets): any {
        const result = [];
        const left = [], center = [], right = [];
        const third = Math.ceil(widgets.length / 3);
        const mod = widgets.length % 3;
        for (let j = 0; j < third; j++) {
            if (widgets[j]) {left.push(widgets[j])};
        }
        const midCount = (mod === 1 ? third * 2 - 1 : third * 2);
        for (let j = third; j < midCount; j++) {
            if (widgets[j]) {center.push(widgets[j])};
        }
        for (let j = midCount; j < widgets.length; j++) {
            if (widgets[j]) {right.push(widgets[j])};
        }
        for (let j = 0; j < third; j++) {
            if (left[j]) {result.push(left[j])};
            if (center[j]) {result.push(center[j])};
            if (right[j]) {result.push(right[j])};
        }
        return result;
    }
    constructor( options: {
        delegate?: FieldsetMeta,
        type?: Type,
        entity?: Entity,
        showDisplayer?: boolean
    } = {}) {
        this.name = options.delegate.name;
        this.border = options.delegate.border;
        const layout = options.delegate.layout;
        let labelWidth = 2;
        let inputWidth = 10;
        let items = [];
        if ('1:1' === layout) {
            items = this.fieldsetsWidgetsHalf(options.delegate.items);
            labelWidth = 2;
            inputWidth = 4;
        } else if ('1:1:1' === layout) {
            items = this.fieldsetsWidgetsThird(options.delegate.items);
            labelWidth = 2;
            inputWidth = 2;
        } else {
            items = options.delegate.items;
        }
        this.labelAlign = options.delegate.labelAlign;

        items.forEach(item => {
            const field = options.type.getField(item.field);
            const typeId = options.type.getId();
            if (field) {
                let editor: string = field.editor;
                let displayer: string = field.displayer;
                let format: string = field.format;
                const schema: Object = field.schema;
                const dataType: DataType = MetaLoader.loadDataType(field.dataType);
                if (dataType.widget) {
                    if (field.editor == null) {
                        editor = dataType.widget.editor;
                    }
                    if (field.displayer == null) {
                        displayer = dataType.widget.displayer;
                    }
                }
                if (dataType.name === 'Date') {
                    format = field.format ? eval('(' + field.format + ')')['moment'] : 'YYYY-MM-DD';
                }
                displayer = 'com.homolo.datamodel.ui.component.DisplayField';
                const widgetConfig: any = {
                    typeId: typeId,
                    fieldName: item.field,
                    label: item.label || field.displayAs,
                    schema: schema,
                    format: format,
                    required: field ? field.allowBlank : false,
                    tip: item.tip,
                    labelWidth: labelWidth,
                    inputWidth: inputWidth,
                    xtype: (options.showDisplayer === true ? displayer : editor),
                    array: field ? field.array : false,
                    onChange: item['onChange']
                }
                widgetConfig.editor = editor;
                if ('com.homolo.datamodel.datatype.IntegerField' === editor) {
                    widgetConfig.widgetType = WidgetType.NumberField;
                    widgetConfig.inputType = 'Number';
                } else if ('com.homolo.datamodel.ui.component.DateField' === editor) {
                    widgetConfig.widgetType = WidgetType.DateField;
                } else {
                    widgetConfig.widgetType = WidgetType.TextField;
                }
                if (options.entity) {
                    if (options.entity.properties) {
                        widgetConfig['value'] = options.entity.properties[widgetConfig.fieldName];
                    }
                    if (options.entity.$displays) {
                        widgetConfig['displayAs'] = options.entity.$displays[widgetConfig.fieldName];
                    }
                }
                if (item.readOnly) {
                    widgetConfig['xtype'] = displayer;
                }
                /* for (var key in widgetConfig) {
                    let widgetConfigKey;
                    switch (key) {
                        case 'editor':
                            widgetConfigKey = 'xtype';
                            break;
                        default:
                            widgetConfigKey = key;
                    }
                    if (item[key] != null && item[key] != undefined && item[key] != '') {
                        widgetConfig[widgetConfigKey] = item[key];
                    }
                } */
                console.log('widgt--init >>>>', item, widgetConfig);
                this.widgets.push(new Widget(widgetConfig));
                return false;
            }
        });
    }


}
