import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PerfectScrollbarComponent, PerfectScrollbarConfigInterface, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { Tasks } from '../../model/tasks';
import { TasksService } from '../../service/tasks.service';
import { PerfectScrollService } from '../../service/perfect-scroll.service';
import { parse } from 'url';
import { Element } from '@angular/compiler';
import { RestClient } from './../../service/rest-client.service';

declare const $: any;

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  providers: [TasksService, PerfectScrollService, RestClient]
})
export class TasksComponent implements OnInit {
  private taskList
  private taskColor: string[];

  private timer: any = null;

  @ViewChild(PerfectScrollbarComponent) componentScroll: PerfectScrollbarComponent;

  constructor(
    private tasksService: TasksService,
    private perfectScrollService: PerfectScrollService,
    private router: Router,
    private restClient: RestClient
  ) { }

  ngOnInit() {
    this.taskColor = ['navy-bg', 'blue-bg', 'lazur-bg', 'yellow-bg'];
    this.taskList = [];

    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.StaticTaskService', 'collection', 'loadTask', {caseId}).then(res => {
      if (res.code === 1) {
        const {result} = res
        this.taskList = result
        this.taskList.map(v => {
          v.isSlide = false
        })
      }
    })

    this.timer = setInterval(() => {
      let psScrollBar: any = document.getElementsByClassName('ps__scrollbar-x-rail')[1];
      if (psScrollBar) {
        let count: string = psScrollBar.getAttribute('style').substring(18);
        count = count.substring(0, count.length - 3);
        this.perfectScrollService.setScrollCount(0)
        if (!parseInt(count)) {
          return;
        }
        this.perfectScrollService.setScrollCount(parseInt(count));
      }
    }, 500)
    let scrollCount: number = this.perfectScrollService.getScrollCount();
    this.componentScroll.directiveRef.scrollTo(0, -scrollCount, 1);
  }

  ngOnDestroy () {
    clearInterval(this.timer);
  }

  private calcTaskOver (items): number {
    let count: number = 0
    if (items) {
      items.map(v => {
        if (v.status === 'Success') {
          count++
        }
      })
      return count
    } else {
      return 0
    }
  }

  private slideTask (i): void {
    $('.js_tasks').eq(i).stop().slideToggle()
    this.taskList[i].isSlide = !this.taskList[i].isSlide
  }

  private gotoTask (link: string, id: string): void {
    window.localStorage.setItem('taskId', id)
    this.router.navigate([link])
  }
}
