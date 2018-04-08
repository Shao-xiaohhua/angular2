import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-costs-list',
  templateUrl: './costs-list.component.html',
  styleUrls: ['./costs-list.component.scss']
})

export class CostsListComponent implements OnInit {
  @Input() costList;
  @Output() onConfirm = new EventEmitter<{}>();

  private todo: string;
  private currentCostList;
  private currentCost: string

  constructor() {
  }

  ngOnInit() {
  }

  private selectCost (cost): void {
    this.currentCostList = cost
    this.currentCost = cost.name
  }

  private initData (): void {
    this.todo = '';
    this.currentCost = '';
  }

  private confirm (): void {
    const { currentCost, todo, currentCostList } = this

    const costData = {
      currentCostList,
      currentCost,
      todo
    }

    this.onConfirm.emit(costData);

    this.initData();
  }
}
