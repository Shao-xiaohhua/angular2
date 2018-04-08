import { Component, OnInit, HostListener } from '@angular/core';
import { detectBody } from '../../../app.helpers';

declare var jQuery: any;

@Component({
  selector: 'app-nav-topnavigationlayout',
  templateUrl: 'top-navigation-layout.template.html'
})
export class TopNavigationLayoutComponent implements OnInit {

  public ngOnInit(): any {
    detectBody();
  }

  @HostListener('window:resize')
  public onResize() {
    detectBody();
  }

}
