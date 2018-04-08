import { Material, Materials } from "./material";

interface Proxy {
  name: string;
  type: string;
  pic: string;
  active: string;
  precent?: number;
}

export interface manageData {
  name: string;
  gender: string;
  pic: string;
  id: string;
  birthDay?: string;
  address: string;
  tel: string;
  category: string;
  active: string;
  precent?: number;
  proxy?: Proxy
}

export interface project {
  matters: [{
    title: string,
    type: string,
    name: string,
    date: string,
    code: string,
    id: string,
    caseId: string,
    status: string,
    assis: string,
    litigantData: manageData[][],
    material: Material[],
    materials: Materials[]
  }]
}
