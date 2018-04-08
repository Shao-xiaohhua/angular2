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

import { StarterViewComponent } from './starterview.component';
import { LoginComponent } from './login.component';
import { LoginTwoComponent } from './login-two.component';
import { LockscreenComponent } from './lockscreen.component';
import { LicenseComponent } from './license.component';

import { AlertComponent } from './alert.component';

const PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    StarterViewComponent,
    LoginComponent,
    LoginTwoComponent,
    AlertComponent,
    LockscreenComponent,
    LicenseComponent
],
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
    PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG)
  ],
  providers: [],
  exports: [
    StarterViewComponent,
    LoginComponent,
    LockscreenComponent,
    LicenseComponent
  ],
})

export class AppviewsModule {
}
