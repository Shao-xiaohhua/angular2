export interface Page {
  id: number;
  name: string;
  picUrl: string;
  isCustom: boolean;
  updatetime: any;
}

export interface Material {
  id: number;
  name: string;
  pages: Page[];
  isComplete: boolean;
  canAdd: boolean;
}
