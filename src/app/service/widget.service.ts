import { Injectable } from '@angular/core';

import { Widget } from '../model/widget';

@Injectable()
export class WidgetService {

    getWidgets() {
        const widgets: Widget<any>[] = [
            new Widget({
                fieldName: 'name',
                label: '姓名',
                tip: '请输入姓名',
                required: true
            }),
            new Widget({
                fieldName: 'nickname',
                label: '昵称',
                value: '小王',
                tip: '请输入昵称'
            }),
            new Widget({
                fieldName: 'email',
                label: 'Email',
                tip: '请输入Email地址',
                required: true
            })
        ];
        return widgets;
    }
}
