import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DataTableModule } from 'angular-4-data-table';
import { DpDatePickerModule } from 'ng2-date-picker';
import { UEditorModule } from 'ngx-ueditor';
import { NgxAddressModule } from 'ngx-address';
import { FileUploadModule } from 'ng2-file-upload';
import { KnobModule } from 'angular2-knob';

import { IboxtoolsModule } from '../components/common/iboxtools/iboxtools.module';

import { WidgetComponent } from './widget/widget.component';
import { TextFieldComponent } from './widget/text-field.component';
import { TextAreaComponent } from './widget/text-area.component';
import { HtmlEditorComponent } from './widget/html-editor.component';
import { IntegerFieldComponent } from './widget/integer-field.component';
import { DoubleFieldComponent } from './widget/double-field.component';
import { BooleanCheckboxComponent } from './widget/boolean-checkbox.component';
import { DateFieldComponent } from './widget/date-field.component';
import { OptionComboComponent } from './widget/option-combo.component';
import { EnumFieldComponent } from './widget/enum-field.component';
import { EntityFieldComponent } from './widget/entity-field.component';
import { ZoneComboComponent } from './widget/zone-combo.component';
import { AttachmentFieldComponent } from './widget/attachment-field.component';
import { DisplayFieldComponent } from './widget/display-field.component';



import { OperationComponent } from './include/operation.component';

import { DetailRendererComponent } from './detail-renderer.component';
import { ListRendererComponent } from './list-renderer.component';
import { SelectRendererComponent } from './select-renderer.component';
import { ViewRendererComponent } from './view-renderer.component';
import { SearchRendererComponent } from './search-renderer.component';
import { BusinessComponent } from './business.component';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
    imports: [
        CommonModule,
        IboxtoolsModule,
        FormsModule,
        DpDatePickerModule,
        UEditorModule.forRoot({
            path: '/assets/ueditor/',
            options: {
                themePath: '/assets/ueditor/themes/'
            }
        }),
        NgxAddressModule,
        KnobModule,
        FileUploadModule,
        TabsModule.forRoot(),
        ModalModule.forRoot(),
        ReactiveFormsModule,
        DataTableModule
    ],
    exports: [
        DetailRendererComponent,
        WidgetComponent,
        TextFieldComponent,
        TextAreaComponent,
        HtmlEditorComponent,
        IntegerFieldComponent,
        DoubleFieldComponent,
        BooleanCheckboxComponent,
        DateFieldComponent,
        OptionComboComponent,
        EnumFieldComponent,
        EntityFieldComponent,
        ZoneComboComponent,
        AttachmentFieldComponent,
        DisplayFieldComponent,
        OperationComponent,
        ListRendererComponent,
        SelectRendererComponent,
        ViewRendererComponent,
        SearchRendererComponent,
        BusinessComponent
    ],
    declarations: [
        DetailRendererComponent,
        WidgetComponent,
        TextFieldComponent,
        TextAreaComponent,
        HtmlEditorComponent,
        IntegerFieldComponent,
        DoubleFieldComponent,
        BooleanCheckboxComponent,
        DateFieldComponent,
        OptionComboComponent,
        EnumFieldComponent,
        EntityFieldComponent,
        ZoneComboComponent,
        AttachmentFieldComponent,
        DisplayFieldComponent,
        OperationComponent,
        ListRendererComponent,
        SelectRendererComponent,
        ViewRendererComponent,
        SearchRendererComponent,
        BusinessComponent
    ],
    entryComponents: [
        ListRendererComponent,
        SelectRendererComponent,
        SearchRendererComponent,
        DetailRendererComponent,
        ViewRendererComponent
    ],
    providers: [],
})

export class DataModelModule { }
