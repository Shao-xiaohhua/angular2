import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { ROUTES } from './app.routes';
import { AppComponent } from './app.component';

import { AlertService } from './service/alert.service';
import { MetaLoader, loadMetaData } from './service/meta-loader.service';
import { RendererMeta} from './service/renderer-meta.service';
import { RestClient } from './service/rest-client.service';
import { DataService } from './service/data.service';
import { Controller } from './service/controller.service';
import { AuthGuard } from './service/auth-guard.service';
import { NzMessageService } from './components/message/nz-message.service';

// App views
import { AppviewsModule } from './views/appviews/appviews.module';
import { CustomModule } from './views/datamodel/custom.module';

// App modules/components
import { LayoutsModule } from './components/common/layouts/layouts.module';
import { ProjectModule } from './views/project/project.module';
import { DashboardModule } from './views/dashboard/dashboard.module';

import { AuthenticationInterceptor } from './authentication-interceptor';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    LayoutsModule,
    AppviewsModule,
    ProjectModule,
    DashboardModule,
    CustomModule,
    RouterModule.forRoot(ROUTES)
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }, AuthGuard, MetaLoader,
    { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true, },
    {provide: APP_INITIALIZER, useFactory: loadMetaData, deps: [MetaLoader], multi: true},
    {provide: LOCALE_ID, useValue: 'ch-CN' },
    DataService, RestClient, Controller, RendererMeta, AlertService, NzMessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
