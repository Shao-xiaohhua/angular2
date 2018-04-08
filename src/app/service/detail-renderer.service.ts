import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Widget, Fieldset } from '../model/widget';

@Injectable()
export class DetailRendererService {
    constructor() {}

    toFormGroup(fieldsets: Fieldset[]) {
        const group: any = [];
        fieldsets.forEach(fieldset => {
            fieldset.widgets.forEach(widget => {
                widget.required = false; // 临时测试关闭校验
                group[widget.fieldName] = widget.required ? new FormControl(widget.value || '', Validators.required)
                                                          : new FormControl(widget.value || '');
            });
        });
        return new FormGroup(group);
    }
}
