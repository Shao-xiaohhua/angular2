import { Operator } from './operator';

export class DataType {
    schema: string;
    displayAs: string;
    name: string;
    format: string;
    validator: string;
    setter: string;
    widget: {
        editor: string;
        displayer: string;
        allowBlank: boolean;
    };
    operators = new Array<Operator>();

    constructor(data: {}) {
        this.name = data['name'];
        this.displayAs = data['displayAs'];
        this.format = data['format'];
        this.schema = data['schema'];
        this.validator = data['validator'];
        this.setter = data['setter'];
        if (data['operators'] != null) {
            this.operators = new Array<Operator>();
            data['operators'].forEach(o => {
                if ('Equals' === o) {
                    this.operators.push(Operator.Equals);
                } else if ('Contains' === o) {
                    this.operators.push(Operator.Contains);
                } else if ('EndsWith' === o) {
                    this.operators.push(Operator.EndsWith);
                } else if ('Ge' === o) {
                    this.operators.push(Operator.Ge);
                } else if ('Gt' === o) {
                    this.operators.push(Operator.Gt);
                } else if ('In' === o) {
                    this.operators.push(Operator.In);
                } else if ('Le' === o) {
                    this.operators.push(Operator.Le);
                } else if ('Lt' === o) {
                    this.operators.push(Operator.Lt);
                } else if ('NotEquals' === o) {
                    this.operators.push(Operator.NotEquals);
                } else if ('NotIn' === o) {
                    this.operators.push(Operator.NotIn);
                } else if ('NotNull' === o) {
                    this.operators.push(Operator.NotNull);
                } else if ('Null' === o) {
                    this.operators.push(Operator.Null);
                } else if ('StartsWith' === o) {
                    this.operators.push(Operator.StartsWith);
                }
            });
        }
        if (data['widget'] != null) {
            this.widget = {
                allowBlank: data['widget']['allowBlank'], displayer: data['widget']['displayer'],
                editor: data['widget']['editor']
            };
        }
    }
}
