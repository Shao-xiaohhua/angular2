import { Component, OnInit } from '@angular/core';

import { AlertService } from '../../service/alert.service';

@Component({
    moduleId: module.id,
    selector: 'app-alert',
    templateUrl: './alert.template.html'
})

export class AlertComponent  implements OnInit {
    message: any;

    constructor(private alertService: AlertService) { }

    ngOnInit() {
        this.alertService.getMessage().subscribe(message => { this.message = message; });
    }
}
