import { Component, Input, OnInit, AfterViewInit, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Widget, WidgetType } from '../../model/widget';
import { RestClient } from '../../service/rest-client.service';
import { RequestMethod, Headers } from '@angular/http';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MetaLoader } from '../../service/meta-loader.service';
import { RendererMeta } from '../../service/renderer-meta.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'dm-widget',
    templateUrl: './widget.component.html'
})
export class WidgetComponent implements AfterViewInit, OnChanges {
    @Input() widget: Widget<any>;
    @Input() form: FormGroup;
    widgetType = WidgetType;

    constructor(
        private restClient: RestClient,
        private rendererMeta: RendererMeta
    ) { }

    public widgetMap = {
        textfield: 'com.homolo.datamodel.ui.component.TextField',
        textarea: 'com.homolo.datamodel.ui.component.TextArea',
        htmleditor: 'com.homolo.datamodel.ui.component.HtmlEditor',
        datefield: 'com.homolo.datamodel.ui.component.DateField',
        integerfield: 'com.homolo.datamodel.ui.component.IntegerField',
        doublefield: 'com.homolo.datamodel.ui.component.DoubleField',
        booleancheckbox: 'com.homolo.datamodel.ui.component.BooleanCheckbox',
        optioncombo: 'com.homolo.datamodel.ui.component.OptionCombo',
        enumfield: 'com.homolo.datamodel.ui.component.EnumField',
        entityfield: 'com.homolo.datamodel.ui.component.EntityField',
        zonecombo: 'com.homolo.datamodel.ui.component.ZoneCombo',
        attachmentfield: 'com.homolo.datamodel.ui.component.AttachmentField',
        displayfield: 'com.homolo.datamodel.ui.component.DisplayField'
    }

    ngAfterViewInit() {
    }

    ngOnChanges() {
        this.valueChangeInit();
    }

    valueChangeInit() {
        const $form = this.form;
        const $renderer = this.rendererMeta;
        const fieldName = this.widget['fieldName'];
        const onChange = this.widget['onChange'];
        if (this.widget && this.form && fieldName && onChange && this.form.contains(fieldName)) {
            this.form.get(fieldName).valueChanges.subscribe(value => {
                eval(onChange);
            });
        }
    }
}
