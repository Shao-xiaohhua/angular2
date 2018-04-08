import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { DndListModule } from 'ngx-drag-and-drop-lists';

import { PaginationModule, TooltipModule, ModalModule, TabsModule } from 'ngx-bootstrap';

import { NgxAddressModule } from 'ngx-address';

import { DataModelModule } from './../../datamodel/datamodel.module';

import { SettlementComponent } from '../../views/datamodel/custom/settlement.component';
import { InvoiceComponent } from '../../views/datamodel/custom/invoice.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        HttpModule,
        NgxAddressModule,
        PaginationModule.forRoot(),
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        DndListModule,
        DataModelModule
    ],
    exports: [
    ],
    declarations: [
        SettlementComponent,
        InvoiceComponent
    ],
    entryComponents: [
    ],
    providers: [],
})

export class CustomModule { }
