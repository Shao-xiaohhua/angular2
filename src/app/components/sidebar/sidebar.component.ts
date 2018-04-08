import { Component } from '@angular/core';
import { MachineService } from '../../service/machine.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  providers: [MachineService]
})
export class SidebarComponent {

  constructor(private machineService: MachineService) { }

  clear (): void {
    const video = localStorage.getItem('_HighShotVideo_');
    const camera = localStorage.getItem('_HighShotCamera_');
    const device = localStorage.getItem('_HighShotDevice_');
    const lastTime = localStorage.getItem('_HighShotLastTime_');
    const sessionId = localStorage.getItem('__sessionId__');
    window.localStorage.clear();
    localStorage.setItem('__sessionId__', sessionId !== null ? sessionId : '');
    localStorage.setItem('_HighShotVideo_', video !== null ? video : '');
    localStorage.setItem('_HighShotCamera_', camera !== null ? camera : '');
    localStorage.setItem('_HighShotDevice_', device !== null ? device : '');
    localStorage.setItem('_HighShotLastTime_', lastTime !== null ? lastTime : '');
  }

  callNo (): void {
    const sessionId = new Date().getTime() + '';
    window.localStorage.setItem('__sessionId__', sessionId);
    this.machineService.videoRecord(sessionId, 'Start').then(res => {
      if (res.result === 'Success') {
        console.log('video start', res);
        alert('成功叫号,请开始办证.');
      }
    });
  }

}
