import { Component, OnInit } from '@angular/core';

interface Proflist {
  name: string[];
  tab: string;
  time: string;
  sign: string;
  mark: string;
}

@Component({
  selector: 'app-proof',
  templateUrl: './proof.component.html',
  styleUrls: ['./proof.component.scss']
})
export class ProofComponent implements OnInit {
  private profList: Proflist;
  private name: string;
  private info: string;

  constructor() { }

  ngOnInit() {
    this.profList = {
      name: ['张三', '王五'],
      tab: '学历公证',
      time: '2017-09-29',
      sign: '李四',
      mark: 'xxxxxxxxxxxxx'
    }
    this.name = this.profList.name[0]
  }

  setName (): void {
    this.info = this.name
  }

}
