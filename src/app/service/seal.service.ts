import { Injectable } from '@angular/core';

let isSign: boolean = false;
let isSeal: boolean = false;

@Injectable()
export class SealService {

  constructor() {
  }

  public getSign(): boolean {
    return isSign;
  }

  public getSeal(): boolean {
    return isSeal;
  }

  public passSign(): void {
    isSign = true;
  }

  public passSeal(): void {
    isSeal = true;
  }

}
