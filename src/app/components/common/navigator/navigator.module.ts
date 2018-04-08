import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NavigatorComponent } from './navigator.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    NavigatorComponent
  ],
  exports: [
    NavigatorComponent
  ]
})

export class NavigatorModule {};
