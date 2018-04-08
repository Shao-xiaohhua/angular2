import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-slide-config',
  templateUrl: './slide-config.component.html',
  styleUrls: ['./slide-config.component.scss']
})
export class SlideConfigComponent implements OnInit {
  @Output() onLoading = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  loading (): void {
    this.onLoading.emit();
  }

}
