import { Component, AfterViewInit, OnDestroy } from '@angular/core';

declare var jQuery: any;

@Component({
  selector: 'app-layout-blank',
  templateUrl: 'blank-layout.template.html'
})

export class BlankLayoutComponent implements AfterViewInit, OnDestroy {

  ngAfterViewInit() {
    jQuery('body').addClass('gray-bg');
  }

  ngOnDestroy() {
    jQuery('body').removeClass('gray-bg');
  }
}
