import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-regulator',
  templateUrl: './regulator.component.html',
  styleUrls: ['./regulator.component.scss']
})
export class RegulatorComponent implements OnInit {

  private loading: boolean;
  private testTime: number;
  private checkCode;
  private countdown: any = {
    leftTime: 2,
    className: 'reg-count'
  };

  constructor(private router: Router) { }

  ngOnInit() {
    this.testTime = 2000;
    this.loading = true;
    this.checkCode = window.localStorage.getItem('CHECKCODE');
    const loadingTimer = setTimeout(() => {
      this.loading = false;
      setTimeout(() => {
        this.router.navigate(['/project/home/settings']);
      }, this.testTime);
      clearTimeout(loadingTimer);
    }, 1000);
  }

}
