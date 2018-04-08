import { Routes } from '@angular/router';

import { DetailRendererComponent } from './datamodel/detail-renderer.component';
import { ListRendererComponent } from './datamodel/list-renderer.component';
import { SelectRendererComponent } from './datamodel/select-renderer.component';
import { BusinessComponent } from './datamodel/business.component';
import { LoginComponent } from './views/appviews/login.component';
import { LoginTwoComponent } from './views/appviews/login-two.component';
import { LockscreenComponent } from './views/appviews/lockscreen.component';
import { AuthGuard } from './service/auth-guard.service';
import { StarterViewComponent } from './views/appviews/starterview.component';
import { BlankLayoutComponent } from './components/common/layouts/blank-layout.component';
import { BasicLayoutComponent } from './components/common/layouts/basic-layout.component';
import { TopNavigationLayoutComponent } from './components/common/layouts/top-navigation-layout.component';

// New Views @ 171025
import { HomeComponent } from './views/project/home.component';
import { ProjectComponent } from './views/project/project.component';
import { DraftListComponent } from './views/project/draft-list/draft-list.component'
import { DraftDiffComponent } from './views/project/draft-diff/draft-diff.component'
import { RecordsComponent } from './views/project/records.component';
import { WorkplaceComponent } from './views/dashboard/workplace/workplace.component';

import { TasksComponent } from './components/tasks/tasks.component';
import { ClientsComponent } from './components/clients/clients.component';
import { SettingsComponent } from './components/settings/settings.component';
import { DataComponent } from './components/data/data.component';
import { DocComponent } from './components/doc/doc.component';
import { CostsComponent } from './components/costs/costs.component';
import { RegComponent } from './components/register/register.component';
import { ConsultComponent } from './components/consult/consult.component'
import { ProjectDataComponent } from './components/project-data/project-data.component';
import { RegulatorComponent } from './components/regulator/regulator.component';
import { VerifyComponent } from './components/verify/verify.component';
import { AddmaterialComponent } from './components/addmaterial/addmaterial.component';
import { CertificateComponent } from './components/certificate/certificate.component';
import { TipsComponent } from './components/tips/tips.component';
import { DraftComponent } from './components/draft/draft.component';
import { ManuscriptComponent } from './components/manuscript/manuscript.component';
import { ExamineComponent } from './components/examine/examine.component';
import { StatementComponent } from './components/statement/statement.component';
import { TalknotesComponent } from './components/talknotes/talknotes.component';
import { NotesComponent } from './components/notes/notes.component';
import { IdentifyComponent } from './components/identify/identify.component';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { ApplyComponent } from './components/apply/apply.component';
import { ArchivesComponent } from './components/archives/archives.component';
import { LicenseComponent } from './views/appviews/license.component';
import { ProcessComponent } from './components/process/process.component';
import { StopComponent } from './components/stop/stop.component';
import { ProcessListComponent } from './components/process-list/process-list.component';
import { DraftCalibrateComponent } from './views/project/draft-calibrate/draft-calibrate.component';
import { PandectComponent } from './views/project/pandect/pandect.component';
import { PandectListComponent } from './views/project/pandect-list/pandect-list.component';

// provides
import { CanLeaveProvide } from './provide/can-leave.provide';
import { PrintComponent } from 'app/components/print/print.component';
import { ReportComponent } from './components/report/report.component';
import { InspectionComponent } from './components/inspection/inspection.component';
// datamodel custom
import { SettlementComponent } from './views/datamodel/custom/settlement.component';
import { InvoiceComponent } from './views/datamodel/custom/invoice.component';

export const ROUTES: Routes = [
  // Main redirect
  { path: '', redirectTo: 'project', pathMatch: 'full' },

  // App views
  {
    path: 'project', component: BasicLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'all',
        component: ProjectComponent
      },
      {
        path: 'data',
        component: ProjectDataComponent
      },
      {
        path: 'pandect-list',
        component: PandectListComponent
      },
      {
        path: 'pandect',
        component: PandectComponent
      },
      {
        path: 'darftlist',
        component: DraftListComponent
      },
      {
        path: 'draftdiff',
        component: DraftDiffComponent
      },
      {
        path: 'draftcalibrate',
        component: DraftCalibrateComponent
      },
      {
        path: '',
        component: RecordsComponent,
        children: [
          { path: '', component: RegComponent },
          { path: 'consult', component: ConsultComponent },
          { path: 'regulator', component: RegulatorComponent }
        ]
      },
      {
        path: 'home',
        component: HomeComponent,
        canDeactivate: [CanLeaveProvide],
        children: [
          {
            path: '',
            component: TasksComponent
          },
          {
            path: 'clients',
            component: ClientsComponent
          },
          {
            path: 'settings',
            component: SettingsComponent
          },
          {
            path: 'data',
            component: DataComponent
          },
          {
            path: 'doc',
            component: DocComponent
          },
          {
            path: 'costs',
            component: CostsComponent
          },
          {
            path: 'identify',
            component: IdentifyComponent,
            canDeactivate: [CanLeaveProvide]
          },
          {
            path: 'addmaterial',
            component: AddmaterialComponent
          },
          {
            path: 'certificate',
            component: CertificateComponent,
            canDeactivate: [CanLeaveProvide]
          },
          {
            path: 'statement',
            component: StatementComponent,
            canDeactivate: [CanLeaveProvide]
          },
          {
            path: 'talknotes',
            component: TalknotesComponent
          },
          {
            path: 'notes',
            component: NotesComponent
          },
          {
            path: 'tips',
            component: TipsComponent
          },
          {
            path: 'manuscript',
            component: ManuscriptComponent
          },
          {
            path: 'draft',
            component: DraftComponent
          },
          {
            path: 'examine',
            component: ExamineComponent
          },
          {
            path: 'confirm',
            component: ConfirmComponent
          },
          {
            path: 'archives',
            component: ArchivesComponent
          },
          {
            path: 'apply',
            component: ApplyComponent
          },
          {
            path: 'process',
            component: ProcessComponent
          },
          {
            path: 'stop',
            component: StopComponent
          },
          {
            path: 'process-list',
            component: ProcessListComponent
          }
        ]
      }
    ]
  },
  {
    path: '', component: BasicLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'business/:name',
        component: BusinessComponent
      }
    ]
  },
  {
    path: 'dashboard', component: BasicLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: WorkplaceComponent
      }
    ]
  },
  {
    path: 'custom', component: BasicLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'settlement',
        component: SettlementComponent
      },
      {
        path: 'invoice',
        component: InvoiceComponent
      }
    ]
  },
  {
    path: '', component: BlankLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'login-two', component: LoginTwoComponent },
      { path: 'license', component: LicenseComponent },
      { path: 'lockscreen', component: LockscreenComponent },
      { path: 'print', component: PrintComponent },
      { path: 'report', component: ReportComponent },
      { path: 'inspection', component: InspectionComponent }
    ]
  },
  // Handle all other routes
  { path: '**', redirectTo: 'project' }
];
