import { Mode } from './mode';
import { Operator } from './operator';
import { Widget } from './widget';


export enum ViewMode {
    Panel, Window
}

export enum LabelAlign {
    left, right, top
}

export class ViewInfo {
    id: string;
    name: string;
    description: string;
    displayAs: string;
    mode: ViewMode;
    closable: boolean;
    refreshable: boolean;
    width: number;
    height: number;
    toolbarVisible: boolean;
    definition: View;
    properties: Map<string, Object>;
    system: boolean;
    inherit: boolean;

    constructor(data: Object) {
        this.id = data['id'];
        this.name = data['name'];
        this.description = data['description'];
        this.displayAs = data['displayAs'];
        const m = data['mode'];
        if ('Panel' === m) {
            this.mode = ViewMode.Panel;
        } else if ('Window' === m) {
            this.mode = ViewMode.Window;
        }
        this.closable = data['closable'];
        this.refreshable = data['refreshable'];
        this.width = data['width'];
        this.height = data['height'];
        this.toolbarVisible = data['toolbarVisible'];
        this.properties = data['properties'];
        const definitionData = data['definition'];
        this.system = data['system'];
        this.inherit = data['inherit'];
        if ('com.homolo.datamodel.view.DetailView' === definitionData['javaClass']) {
            this.definition = new DetailView(definitionData);
        } else if ('com.homolo.datamodel.view.SearchView' === definitionData['javaClass']) {
            this.definition = new SearchView(definitionData);
        } else if ('com.homolo.datamodel.view.ListView' === definitionData['javaClass']) {
            this.definition = new ListView(definitionData);
        }
    }

    getId(): string {
        return this.id;
    }

    getTypeName(): string {
        return this.id.split('@')[0];
    };

    getName(): string {
        return this.name;
    }

    getDisplayAs(): string {
        return this.displayAs;
    }

    getDefinition(): View {
        return this.definition;
    }

    getProperties(): Map<string, Object> {
        return this.properties || new Map<string, Object>();
    };

    getProperty(propertyName): Object {
        return this.getProperties()[propertyName];
    };

    isInherit(): boolean {
        return this.inherit || false;
    }

    isSystem(): boolean {
        return this.system || false;
    }
    isClosable(): boolean {
        return this.closable || false;
    }
    isRefreshable(): boolean {
        return this.refreshable || false;
    }

}


export interface View {
    getMode(): Mode;
}

export class DetailView implements View {
    fieldsets = new Array<Fieldset>();
    relates = new Array<string>();

    getMode() {
        return Mode.Entity;
    }

    constructor(data: Object) {
        this.relates = data['relates'];
        data['fieldsets'].forEach(fieldsetsData => {
            this.fieldsets.push(new Fieldset(fieldsetsData));
        });
    }
}


export class Fieldset {
    name: string;
    layout: string;
    xtype: string;
    border: boolean;
    style: string;
    labelAlign = LabelAlign.left;
    collapsible = false;
    collapsed = false;
    readOnly = false;
    hidden = false;
    items = new Array<FieldItem>();

    constructor(data: Object) {
        this.name = data['name'];
        this.layout = data['layout'];
        this.border = data['border'];
        this.style = data['style'];
        const a = data['labelAlign'];
        if ('left' === a) {
            this.labelAlign = LabelAlign.left;
        } else if ('right' === a) {
            this.labelAlign = LabelAlign.right;
        } else if ('top' === a) {
            this.labelAlign = LabelAlign.top;
        }
        this.collapsible = data['collapsible'];
        this.collapsed = data['collapsed'];
        this.readOnly = data['readOnly'];
        this.hidden = data['hidden'];
        data['items'].forEach(itemData => {
            this.items.push(new FieldItem(itemData));
        });
    }
}

export class FieldItem {
    field: string;
    defaultValue: Object;
    label: string;
    tip: string;
    editor: string;
    displayer: string;
    col: number;
    row: number;
    onChange: string;
    widget: Widget<Object>;
    allowBlank = false;
    readOnly = false;

    constructor(itemData: Object) {
        this.field = itemData['field'];
        this.defaultValue = itemData['defaultValue'];
        this.label = itemData['label'];
        this.col = itemData['col'];
        this.row = itemData['row'];
        this.onChange = itemData['onChange'];
        const widget = itemData['widget'];
        if (widget != null) {
            this.allowBlank = widget['allowBlank'];
            this.readOnly = widget['readOnly'];
            this.editor = widget['editor'];
            this.displayer = widget['displayer'];
            this.widget = widget;
        }
    }
}


export class SearchView implements View {

    pageSize: number;
    supportFilter: boolean;
    columns = new Array<Column>();
    conditions = new Array<Condition>();
    sortField: string;
    sortAsc = true;
    multiCheck = false;

    getMode() {
        return Mode.Collection;
    }

    constructor(data: Object) {
        this.pageSize = data['pageSize'] || 20;
        this.supportFilter = data['supportFilter'];
        this.multiCheck = data['multiCheck'];
        data['columns'].forEach(columnData => {
            this.columns.push(new Column(columnData));
        });
        if (data['conditions'] != null) {
            data['conditions'].forEach(conditionData => {
                this.conditions.push(new Condition(conditionData));
            });
        }
        const sort = data['sort'];
        if (sort != null) {
            this.sortField = sort['field'];
            this.sortAsc = sort['asc'];
        }
    }
}

export class Condition {
    field: string;
    label: string;
    defaultOperator: Operator;
    input: string;
    config: string;
    constructor(data: {}) {
        this.field = data['field'];
        this.label = data['label'];
        this.input = data['input'];
        this.config = data['config'];
        const o = data['defaultOp'];
        if ('Equals' === o) {
            this.defaultOperator = Operator.Equals;
        } else if ('Contains' === o) {
            this.defaultOperator = Operator.Contains;
        } else if ('EndsWith' === o) {
            this.defaultOperator = Operator.EndsWith;
        } else if ('Ge' === o) {
            this.defaultOperator = Operator.Ge;
        } else if ('Gt' === o) {
            this.defaultOperator = Operator.Gt;
        } else if ('In' === o) {
            this.defaultOperator = Operator.In;
        } else if ('Le' === o) {
            this.defaultOperator = Operator.Le;
        } else if ('Lt' === o) {
            this.defaultOperator = Operator.Lt;
        } else if ('NotEquals' === o) {
            this.defaultOperator = Operator.NotEquals;
        } else if ('NotIn' === o) {
            this.defaultOperator = Operator.NotIn;
        } else if ('NotNull' === o) {
            this.defaultOperator = Operator.NotNull;
        } else if ('Null' === o) {
            this.defaultOperator = Operator.Null;
        } else if ('StartsWith' === o) {
            this.defaultOperator = Operator.StartsWith;
        }
    }
}

export class ListView implements View {
    pageSize: number;
    sortField: string;
    sortAsc = false;
    columns = new Array<Column>();
    businessColumnVisible = false;
    getMode() {
        return Mode.Collection;
    }

    constructor(data: Object) {
        this.pageSize = data['pageSize'] || 20;
        this.businessColumnVisible = data['businessColumnVisible'];
        data['columns'].forEach(columnData => {
            this.columns.push(new Column(columnData));
        });
        const sort = data['sort'];
        if (sort != null) {
            this.sortField = sort['field'];
            this.sortAsc = sort['asc'];
        }
    }
}

export class Column {

    field: string;
    header: string;
    convertor: string;
    sortable: boolean;
    width: number;
    minWidth: number;
    flex: number;
    align = Align.left;

    constructor(data: Object) {
        this.field = data['field'];
        this.header = data['header'];
        this.convertor = data['convertor'];
        this.sortable = data['sortable'];
        this.width = data['width'];
        this.minWidth = data['minWidth'];
        this.flex = data['flex'];
        const a = data['align'];
        if ('left' === a) {
            this.align = Align.left;
        } else if ('right' === a) {
            this.align = Align.right;
        } else if ('center' === a) {
            this.align = Align.center;
        }
    }
}

export enum Align {
    left, center, right
}

