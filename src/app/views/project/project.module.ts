import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { NgxAddressModule } from 'ngx-address';
import { TooltipModule, ModalModule, TabsModule, PaginationModule } from 'ngx-bootstrap';
import { PerfectScrollbarModule, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { DiffMatchPatchModule } from 'ng-diff-match-patch'

import { CountdownModule } from 'ngx-countdown';
import { DndListModule } from 'ngx-drag-and-drop-lists';

import { HomeComponent } from './home.component';
import { ProjectComponent } from './project.component';
import { DraftListComponent } from './draft-list/draft-list.component'
import { RecordsComponent } from './records.component';
import { OverviewComponent } from '../../components/overview/overview.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TasksComponent } from '../../components/tasks/tasks.component';
import { ClientsComponent } from '../../components/clients/clients.component';
import { ClientComponent } from '../../components/client/client.component';
import { SettingsComponent } from '../../components/settings/settings.component';
import { DataComponent } from '../../components/data/data.component';
import { DocComponent } from '../../components/doc/doc.component';
import { CostsComponent } from '../../components/costs/costs.component';
import { CostsListComponent } from '../../components/costs/costs-list/costs-list.component'
import { CaseTypeComponent } from '../../components/register/case-type.component';
import { TalktempComponent } from '../../components/talknotes/talktemp.component';
import { RegComponent } from '../../components/register/register.component';
import { ConsultComponent } from '../../components/consult/consult.component'
import { ProjectDataComponent } from '../../components/project-data/project-data.component';
import { RegulatorComponent } from '../../components/regulator/regulator.component';
import { CardReaderComponent } from '../../components/card-reader/card-reader.component';
import { Select2Component } from '../../components/select2/select2.component';
import { IdentifyComponent } from '../../components/identify/identify.component';
import { AddmaterialComponent } from '../../components/addmaterial/addmaterial.component';
import { CertificateComponent } from '../../components/certificate/certificate.component';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { ApplyComponent } from '../../components/apply/apply.component';
import { SignComponent } from '../../components/sign/sign.component';
import { ProcessComponent } from '../../components/process/process.component';
import { ProcessListComponent } from '../../components/process-list/process-list.component';

import { ManuscriptComponent } from '../../components/manuscript/manuscript.component';
import { ExamineComponent } from '../../components/examine/examine.component';
import { StatementComponent } from '../../components/statement/statement.component';
import { TalknotesComponent } from '../../components/talknotes/talknotes.component';
import { VariableComponent } from '../../components/notes/variable.component';
import { NotesComponent } from '../../components/notes/notes.component';
import { AddClientsComponent } from '../../components/add-clients/add-clients.component';
import { PhotographComponent } from '../../components/photograph/photograph.component';
import { PhotoSwiperComponent } from '../../components/photo-swiper/photo-swiper.component';
import { AddProjectsComponent } from '../../components/add-projects/add-projects.component';
import { TipsComponent } from '../../components/tips/tips.component';
import { DraftComponent } from '../../components/draft/draft.component';
import { SlideConfigComponent } from '../../components/slide-config/slide-config.component';
import { PrintComponent } from 'app/components/print/print.component';
import { ArchivesComponent } from '../../components/archives/archives.component';
import { DrafttemplateComponent } from '../../components/draft/drafttemplate.component';
import { ReportComponent } from '../../components/report/report.component';
import { InspectionComponent } from '../../components/inspection/inspection.component';

// provides
import { CanLeaveProvide } from '../../provide/can-leave.provide';
import { DataModelModule } from 'app/datamodel/datamodel.module';

// message
import { NzMessageModule } from '../../components/message/nz-message.module';
import { from } from 'rxjs/observable/from';
import { TemplateComponent } from 'app/components/template/template.component';
import { StopComponent } from 'app/components/stop/stop.component';
import { DraftDiffComponent } from './draft-diff/draft-diff.component';
import { DraftCalibrateComponent } from './draft-calibrate/draft-calibrate.component';

// 其他模块
import { EditorModule } from '../../components/common/editor/editor.module';
import { NavigatorModule } from '../../components/common/navigator/navigator.module';
import { PandectComponent } from './pandect/pandect.component';
import { PandectListComponent } from './pandect-list/pandect-list.component';

const PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  imports: [
    BrowserModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgxAddressModule,
    DndListModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    DiffMatchPatchModule,
    CountdownModule,
    PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG),
    HttpModule,
    DataModelModule,
    NzMessageModule,
    EditorModule,
    NavigatorModule
  ],
  declarations: [
    HomeComponent,
    ProjectComponent,
    DraftListComponent,
    SidebarComponent,
    OverviewComponent,
    TasksComponent,
    ClientsComponent,
    ClientComponent,
    SettingsComponent,
    DataComponent,
    DocComponent,
    CostsComponent,
    CostsListComponent,
    RecordsComponent,
    CaseTypeComponent,
    RegComponent,
    ConsultComponent,
    ProjectDataComponent,
    RegulatorComponent,
    CardReaderComponent,
    Select2Component,
    AddClientsComponent,
    AddProjectsComponent,
    PhotographComponent,
    PhotoSwiperComponent,
    TipsComponent,
    DraftComponent,
    IdentifyComponent,
    AddmaterialComponent,
    CertificateComponent,
    ConfirmComponent,
    ManuscriptComponent,
    ExamineComponent,
    StatementComponent,
    TalknotesComponent,
    VariableComponent,
    NotesComponent,
    SlideConfigComponent,
    TalktempComponent,
    DrafttemplateComponent,
    PrintComponent,
    ArchivesComponent,
    ReportComponent,
    InspectionComponent,
    TemplateComponent,
    ApplyComponent,
    SignComponent,
    ProcessComponent,
    StopComponent,
    ProcessListComponent,
    DraftDiffComponent,
    DraftCalibrateComponent,
    PandectComponent,
    PandectListComponent
],
  exports: [
    HomeComponent,
    ConsultComponent,
    RecordsComponent,
    ProjectComponent,
    CaseTypeComponent,
    RegComponent,
    RegulatorComponent
  ],
  providers: [
    CanLeaveProvide
  ]
})
export class ProjectModule { }
