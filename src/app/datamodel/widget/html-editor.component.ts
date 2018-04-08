/**
 * https://github.com/cipchk/ngx-ueditor
 */

import { Component, Input, OnInit, OnChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UEditorComponent } from 'ngx-ueditor';
import { Widget, WidgetType } from '../../model/widget';
import { environment } from '../../../environments/environment';

declare var require: any;
const $ = require('jquery');

@Component({
    selector: 'widget-htmleditor',
    templateUrl: './html-editor.component.html'
})
export class HtmlEditorComponent implements AfterViewInit {
    @ViewChild('full') full: UEditorComponent;
    @Input() widget: Widget<any>;
    @Input() form: FormGroup;
    widgetType = WidgetType;

    serverUrl = environment.restServiceUrl + 'tk.File/collection/upload';

    config: any = {
        serverUrl: this.serverUrl,
        enableAutoSave: false,
        scaleEnabled: true,
        elementPathEnabled: false,
        wordCount: false,
        enableContextMenu: false,
        emotionLocalization: true,
        maximumWords: 10000,
        minFrameHeight: 100,
        maxFrameHeight: 300,
        initialFrameHeight: 180,
        // zIndex: 3333,
        autoHeightEnabled: false,
        toolbars: [[
            // 'fullscreen', // 全屏被覆盖 zIndex 失效
            'source', 'undo', 'redo', 'bold', 'italic', 'underline', 'fontborder',
            'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset',
            'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist',
            'selectall', 'cleardoc', 'emotion'
        ]]
    }

    constructor(private el: ElementRef) { }

    ngAfterViewInit() {
    }


    onReadyUE(comp: UEditorComponent) {
        const UE = comp.Instance;
        UE.getActionUrl = function (action) {
            return this.serverUrl;
        }
        UE._bkGetActionUrl = UE.getActionUrl;
    }


    get isValid() {
        return this.form.controls[this.widget.fieldName].valid;
    }
    get isDirty() {
        return this.form.controls[this.widget.fieldName].dirty;
    }
    get isTouched() {
        return this.form.controls[this.widget.fieldName].touched;
    }
}
