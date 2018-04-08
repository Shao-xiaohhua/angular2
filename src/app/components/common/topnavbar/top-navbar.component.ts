import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { MetaLoader } from '../../../service/meta-loader.service';
import { smoothlyMenu } from '../../../app.helpers';
import { environment } from '../../../../environments/environment';

declare var jQuery: any;

@Component({
  selector: 'app-nav-topnavbar',
  templateUrl: 'top-navbar.template.html'
})

export class TopNavbarComponent {
  private userName: string;
  private toogle: Boolean = true;

  constructor(private router: Router, private http: Http) {
    this.userName = MetaLoader.CURRENT_USER.userName;
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

  toggleNavigation(): void {
    this.toogle = !this.toogle;
    jQuery('body').toggleClass('mini-navbar');
    smoothlyMenu();
  }

}
