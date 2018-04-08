import { Injectable } from '@angular/core';
import { RequestMethod, Headers } from '@angular/http';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MetaLoader } from './meta-loader.service';
import 'rxjs/add/operator/toPromise';

import { environment } from '../../environments/environment';


@Injectable()
export class RestClient {

    methodMapping = new Map<string, RequestMethod>([
        ['get', RequestMethod.Get],
        ['query', RequestMethod.Get],
        ['retrieve', RequestMethod.Get],
        ['meta', RequestMethod.Get],
        ['*', RequestMethod.Post]
    ]);

    module: string;
    id: string;

    static getResourceURL(module: string, id: string, action: string): string {
        return environment.restServiceUrl + module + '/' + id + '/' + action;
    };

    static getCollectionURL(module: string, action: string): string {
        return this.getResourceURL(module, 'collection', action);
    };

    getRequestMethod(action: string): RequestMethod {
        return this.methodMapping.get(action) || this.methodMapping.get('*');
    }

    request(module: string, id: string, action: string, params: {}): Promise<any> {
        const requestMethod = this.getRequestMethod(action);
        if (RequestMethod.Post === requestMethod) {
            const headers = new HttpHeaders().set('Content-Type', 'application/json').set('X-CSRF-TOKEN', MetaLoader.CSRF_TOKEN);
            return this.http.post(environment.restServiceUrl + module + '/' + id + '/' + action, params, {
                headers: headers
            }).toPromise().catch(this.handleError);
        }
        const getParams = new HttpParams();
        for (const p in params) {
            if (params.hasOwnProperty(p)) {
                getParams.set(p, params[p]);
            }
        }
        return this.http.get(environment.restServiceUrl + module + '/' + id + '/' + action, { params: getParams })
            .toPromise().catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        // console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

    constructor(private http: HttpClient) {
    }

}
