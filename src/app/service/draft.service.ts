import { Injectable } from '@angular/core';

const activeLitigant = [];

@Injectable()
export class DraftService {

  constructor() { }

  getActiveLitigant () {
    return activeLitigant;
  }

}
