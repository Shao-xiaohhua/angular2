import { Component } from '@angular/core';
import { MachineService } from './../../../service/machine.service';
import { MetaLoader } from './../../../service/meta-loader.service';

@Component({
  selector: 'app-footer',
  templateUrl: 'footer.template.html',
  providers: [MachineService]
})
export class FooterComponent {

  constructor(private machineService: MachineService) {}
  private redictIndex(): void {
    this.machineService.redirect('welcome', null, null);
  }

  private redictIntrc(): void {
    this.machineService.redirect('badge', MetaLoader.CURRENT_USER.personId, null);
  }
 }
