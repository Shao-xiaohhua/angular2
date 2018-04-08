import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BsDropdownModule} from 'ngx-bootstrap';

import {IboxtoolsComponent} from './iboxtools.component';
import { IboxToggleComponent } from './ibox-toggle.component';

@NgModule({
  declarations: [IboxtoolsComponent, IboxToggleComponent],
  imports     : [CommonModule, BsDropdownModule.forRoot()],
  exports     : [IboxtoolsComponent, IboxToggleComponent],
})

export class IboxtoolsModule {}
