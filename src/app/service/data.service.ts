import { Injectable } from '@angular/core';
import { RestClient } from './rest-client.service';

@Injectable()
export class DataService {

    constructor(private restClient: RestClient) { }

    invoke(name: string, params: {}): Promise<any> {
        return this.restClient.request('dm.DataService', name, 'invoke', params);
    }

    checkEntityGrants(businessId: string, entityId?: string): Promise<boolean> {
        return this.restClient.request('dm.DataService', entityId || 'collection', 'checkEntityGrants',
            { businessId: businessId }).then(result => {
                return result['code'] === 1 ? result['result'] : false;
            });
    }

    checkBusinessExecutable(businessId: string, entityId?: string): Promise<boolean> {
        return this.restClient.request('dm.DataService', entityId || 'collection', 'checkBusinessExecutable',
            { businessId: businessId, entityId: entityId }).then(result => {
                return result['code'] === 1 ? result['result'] : false;
            });
    }

    checkOperationExecutable(businessId: string, operation: string, entityId?: string): Promise<boolean> {
        return this.restClient.request('dm.DataService', entityId || 'collection', 'checkOperationExecutable',
            { businessId: businessId, operation: operation, entityId: entityId }).then(result => {
                return result['code'] === 1 ? result['result'] : false;
            });
    }
}
