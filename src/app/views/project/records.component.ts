import { Component, OnInit, OnDestroy } from '@angular/core';

declare var jQuery: any;

@Component({
  selector: 'records',
  templateUrl: './records.template.html',
  styleUrls: ['./project.component.scss']
})
export class RecordsComponent implements OnDestroy, OnInit {

  public nav: any;
  public wrapper: any;

  public constructor() {
    this.nav = document.querySelector('nav.navbar');
    this.wrapper = document.getElementById('page-wrapper');
  }

  public ngOnInit(): any {
    this.nav.className += ' white-bg';
    this.wrapper.className += ' sidebar-content';
  }

  public ngOnDestroy(): void {
    this.nav.classList.remove('white-bg');
    this.wrapper.classList.remove('sidebar-content');
  }

}
