export class Case {
  caseId: string;
  projectList: Project[];
  clients: Clients[];
}

export class Clients {
  clientId: string;
  name: string;
  gender: string;
  avatar: string;
  certificate: string;
  certificateNum: string;
  address: string;
  postalAddr: string;
  phoneNum: number;
}

export class Project {
  projectId: string;
  projectType: string;
  projectName: string;
  createTime: string;
  notaryName: string;
}