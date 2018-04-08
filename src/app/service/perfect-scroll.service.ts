import { Injectable } from '@angular/core';

let scrollCount = 0;

@Injectable()
export class PerfectScrollService {

  constructor() { }

  public getScrollCount (): number {
    return scrollCount;
  }

  public setScrollCount (count: number) {
    scrollCount = count;
  }

}
