import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import 'jquery-slimscroll';
import { Menu } from '../../../model/menu';
import { MetaLoader } from '../../../service/meta-loader.service';
import { RestClient } from '../../../service/rest-client.service';

import { environment } from '../../../../environments/environment';

declare var jQuery: any;

@Component({
  selector: 'app-navigation',
  templateUrl: 'navigation.template.html'
})
export class NavigationComponent implements AfterViewInit, OnInit {

  public userInfo;
  public notaryOffice;

  menu: Menu;

  constructor(private router: Router, private metaLoader: MetaLoader, private http: HttpClient, private restClient: RestClient) {
    this.menu = MetaLoader.MENU;
    this.userInfo = MetaLoader.CURRENT_USER;
    this.notaryOffice = MetaLoader.CURRENT_NOTARYOFFICE;
    if (this.menu == null || this.menu.reloadRequired === true) {
      this.reloadMenu();
    }
  }

  ngAfterViewInit() {
    jQuery('#side-menu').metisMenu();
    if (jQuery('body').hasClass('fixed-sidebar')) {
      jQuery('.sidebar-collapse').slimscroll({
        height: '100%'
      })
    }
  }

  ngOnInit() {

  }

  activeRoute(routename: string): boolean {
    return this.router.url.indexOf(routename) > -1;
  }

  logout(): void {
    this.http.get(environment.serverUrl + '/logout').toPromise().then(res => {
      MetaLoader.CSRF_TOKEN = null;
      this.router.navigateByUrl('/login');
    }).catch(error => {
      MetaLoader.CSRF_TOKEN = null;
      this.router.navigateByUrl('/login');
    });
  }

  private reloadMenu(): void {
    this.http.get(RestClient.getResourceURL('tk.Menu', environment.menuName, 'access')).toPromise().then(res => {
      console.log('reload menu...');
      this.menu = new Menu(res);
      MetaLoader.MENU = this.menu;
    });
  }

}
