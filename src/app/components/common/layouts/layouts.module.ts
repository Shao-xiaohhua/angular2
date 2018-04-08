import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BsDropdownModule, TooltipModule } from 'ngx-bootstrap';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { BasicLayoutComponent } from './basic-layout.component';
import { BlankLayoutComponent } from './blank-layout.component';
import { TopNavigationLayoutComponent } from './top-navigation-layout.component';

import { NavigationComponent } from './../navigation/navigation.component';
import { FooterComponent } from './../footer/footer.component';
import { TopNavbarComponent } from './../topnavbar/top-navbar.component';
import { TopNavigationNavbarComponent } from './../topnavbar/top-navigation-navbar.component';

import { HighShotComponent } from './../../high-shot/high-shot.component';


@NgModule({
  declarations: [
    FooterComponent,
    BasicLayoutComponent,
    BlankLayoutComponent,
    NavigationComponent,
    TopNavigationLayoutComponent,
    TopNavbarComponent,
    TopNavigationNavbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BsDropdownModule.forRoot(),
    TooltipModule,
    ToastModule.forRoot()
  ],
  exports: [
    FooterComponent,
    BasicLayoutComponent,
    BlankLayoutComponent,
    NavigationComponent,
    TopNavigationLayoutComponent,
    TopNavbarComponent,
    TopNavigationNavbarComponent
  ],
})

export class LayoutsModule { }
