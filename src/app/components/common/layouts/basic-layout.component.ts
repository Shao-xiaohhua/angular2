import { Component, OnInit, ViewContainerRef, HostListener } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { MetaLoader } from '../../../service/meta-loader.service';
import { detectBody } from '../../../app.helpers';
import { MachineService } from '../../../service/machine.service';
import { environment } from '../../../../environments/environment';
declare var jQuery: any;

@Component({
  selector: 'app-layout-basic',
  templateUrl: 'basic-layout.template.html',
  providers: [MachineService]
})

export class BasicLayoutComponent implements OnInit {

  constructor(public toastr: ToastsManager,
    vcr: ViewContainerRef,
    private machineService: MachineService) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  public ngOnInit(): any {
    detectBody();
    let userInfo = '';
    if (MetaLoader.CURRENT_USER != null) {
      userInfo = MetaLoader.CURRENT_USER.nickName + ',';
    }

    // this.toastr.success(userInfo + '欢迎登录后台管理', '欢迎', {toastLife: 3000});
    this.machineService.redirect('badge', MetaLoader.CURRENT_USER.personId, null);
  }

  @HostListener('window:resize')
  public onResize() {
    detectBody();
  }

}
