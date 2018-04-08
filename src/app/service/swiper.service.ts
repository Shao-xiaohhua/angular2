import { Injectable } from '@angular/core';

let index = 0;

@Injectable()
export class SwiperService {
  constructor () {
  }

  getIndex () {
    return index;
  }

  addIndex () {
    index++;
    return index;
  }

  decIndex () {
    index--;
    return index;
  }

  initIndex (newIndex) {
    index = newIndex;
    return index;
  }
}
