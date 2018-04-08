import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { DataTableParams } from 'angular-4-data-table';
import 'rxjs/add/operator/toPromise';

import { Entity } from '../model/entity';

const SERVICE_URL = 'http://localhost:4200/assets/entity-page.json?';

function paramsToQueryString(params: DataTableParams) {
    if (params == null) {
        return '';
    }
    const result = [];

    if (params.offset != null) {
        result.push(['start', params.offset]);
    }
    if (params.limit != null) {
        result.push(['limit', params.limit]);
    }
    if (params.sortBy != null) {
        result.push(['sort', params.sortBy]);
    }
    if (params.sortAsc != null) {
        result.push(['dir', params.sortAsc ? 'ASC' : 'DESC']);
    }

    return result.map(param => param.join('=')).join('&');
}

interface EntityPageResponse {
    total: number;
    items: Entity[];
}

@Injectable()
export class EntityService {

    constructor(private http: Http) {}

    query(params: DataTableParams) {
        return this.http.get(SERVICE_URL + paramsToQueryString(params)).toPromise()
            .then((response: Response) => {
                const items: Object[] = response.json()['items'];
                const responseItems = new Array();
                items.forEach(item => {
                    const obj = item['properties'];
                    obj['id'] = item['id'];
                    obj['typeId'] = item['typeId'];
                    obj['dateCreated'] = item['dateCreated'];
                    responseItems.push(obj);
                });
                return {total: response.json()['total'], items: responseItems};
            });
    }
}
