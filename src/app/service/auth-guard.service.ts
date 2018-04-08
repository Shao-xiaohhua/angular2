import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { MetaLoader } from '../service/meta-loader.service'

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

    constructor(private router: Router) { }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.isUserLogin();
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.isUserLogin();
    }

    isUserLogin(): boolean {
        if (MetaLoader.CURRENT_USER == null || MetaLoader.CURRENT_USER.anonymous) {
            console.log('user not login, redirect to login.');
            return false;
        }
        return true;
    }

}
