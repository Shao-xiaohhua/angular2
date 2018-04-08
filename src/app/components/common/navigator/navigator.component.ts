import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss']
})
export class NavigatorComponent implements OnInit {
  @Input() headLine: string;

  constructor() { }

  ngOnInit() {
  }

}
