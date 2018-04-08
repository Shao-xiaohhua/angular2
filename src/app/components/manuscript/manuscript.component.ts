import { Component, OnInit } from '@angular/core';

interface Manulist {
  name: string[];
  tab: string;
  time: string;
  sign: string;
}

@Component({
  selector: 'app-manuscript',
  templateUrl: './manuscript.component.html',
  styleUrls: ['./manuscript.component.scss']
})
export class ManuscriptComponent implements OnInit {
  private manuList: Manulist;
  private name: string;
  private info: string;

  constructor() { }

  ngOnInit() {
    this.manuList = {
      name: ['张三', '王五'],
      tab: '学历公证',
      time: '2017-09-29',
      sign: '李四'
    }
    this.name = this.manuList.name[0]
  }

  setName (): void {
    this.info = this.name
  }

}
