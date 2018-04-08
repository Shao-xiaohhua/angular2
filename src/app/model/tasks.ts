interface Items {
  title: string;
  status: string;
  date: string;
  desc: string;
  link: string;
}

export interface Tasks {
  icon: string;
  title: string;
  items: Items[]
}
