import { Component } from '@angular/core';
import {Router} from '@angular/router';
import { smoothlyMenu } from '../../../app.helpers';

declare var jQuery: any;

@Component({
  selector: 'app-nav-topnavigation-navbar',
  templateUrl: 'top-navigation-navbar.template.html'
})
export class TopNavigationNavbarComponent {

  toggleNavigation(): void {
    jQuery('body').toggleClass('mini-navbar');
    smoothlyMenu();
  }

}
