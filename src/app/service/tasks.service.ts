import { Injectable } from '@angular/core';

// 任务类型：success error doing wait
const tasks = [
];

@Injectable()
export class TasksService {

  constructor() { }

  getTaskList () {
    return tasks;
  }
}
