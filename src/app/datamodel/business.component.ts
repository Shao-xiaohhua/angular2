import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router'

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { MetaLoader } from '../service/meta-loader.service';
import { Business } from '../model/business';
import { View } from '../model/view';
import { Type } from '../model/type';

@Component({
    selector: 'dm-business',
    templateUrl: './business.component.html'
})
export class BusinessComponent implements OnInit {

    business: Business;
    config: Object = {};

    constructor(private route: ActivatedRoute, public toastr: ToastsManager, vcr: ViewContainerRef) {
        this.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        // this.entityId = this.route.snapshot.queryParams['entityId'];
        this.config = this.route.snapshot.queryParams;
        this.route.queryParamMap.map(params => console.log('params.......', params));
        this.route.paramMap
            .switchMap((params: ParamMap) => {
                console.log(params.get('name'), params);
                const business = MetaLoader.loadBusiness(params.get('name'));
                if (business == null) {
                    this.toastr.error('未找到业务', '错误', { dismiss: 'click' });
                }
                return Promise.resolve(business);
            }).subscribe(business => this.business = business);

    }

    get view(): View {
        return MetaLoader.loadType(this.business.typeName).getView(this.business.view).definition;
    }

    get type(): Type {
        return MetaLoader.loadType(this.business.typeName);
    }
}
