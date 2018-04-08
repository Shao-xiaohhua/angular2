import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';

declare const $: any;

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.scss']
})

export class SignComponent implements OnInit {
  private isSlide: boolean;
  @Input() signConfig: any;
  @Output() event = new EventEmitter();
  constructor() {}
  ngOnInit() {
    this.isSlide = false;
  }

  private slide (isSlide: boolean): void {
    $('.js-sign-slide').stop().slideToggle();
    this.isSlide = isSlide;
  }

  private resetSign (): void {
    this.event.emit('resetSign');
  }
}
