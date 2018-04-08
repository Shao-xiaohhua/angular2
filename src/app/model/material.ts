export interface Material {
  id?: string;
  name: string;
  type: string;
  pic?: string;
  date?: string;
  status: string;
}

export interface Page {
  id?: string;
  name: string;
  pic: string;
  isCustom: boolean;
  updatetime: any;
  status: string;
  result?: object;
  readonly: boolean;
}

export interface Materials {
  id?: string;
  name: string;
  pages: Page[];
  isComplete: boolean;
  canAdd: boolean;
}
