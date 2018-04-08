import { Injectable } from '@angular/core';
import { Material } from "../model/material";
import { materialize } from 'rxjs/operator/materialize';

const initMaterial: Material[] = [
  {
    type: '身份证正面',
    name: '张盛磊',
    pic: '',
    date: '',
    status: 'wait'
  },
  {
    type: '身份证反面',
    name: '张盛磊',
    pic: '',
    date: '',
    status: 'wait'
  }
]

@Injectable()
export class InitMaterialService {

  constructor() { }

  getInitMaterial(): Material[] {
    return initMaterial
  }
}
