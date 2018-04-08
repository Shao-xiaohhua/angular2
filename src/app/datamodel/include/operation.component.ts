import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RendererMeta } from '../../service/renderer-meta.service';
import { MetaLoader } from '../../service/meta-loader.service';

@Component({
  selector: 'dm-operation',
  templateUrl: './operation.component.html'
})
export class OperationComponent implements OnChanges {
  @Input() page: any;
  private operations: any = [];

  constructor(private rendererMeta: RendererMeta) { }
  ngOnChanges() {
    this.checkUpdate();
  }

  public checkUpdate() {
    const ops = this.page.business.operations;
    this.operations = [];
    for (const i in ops) {
      if (ops.hasOwnProperty(i)) {
        const op = ops[i];
        if ('Business' === op['type']) { // 只处理是业务得操作按钮
          const name = this.page.business['typeName'] + '@' + op['content'];
          const bus = MetaLoader.loadBusiness(name)
          if (bus) {
            const operation = {};
            operation['name'] = op['name']
            operation['mode'] = bus.mode;
            this.operations.push(operation);
          }
        } else {
          const operation = {};
          operation['name'] = op['name']
          operation['mode'] = 1;
          this.operations.push(operation);
        }
      }
    }
  }

  onOpClick(name) {
    console.log('onOpClick....', name);
    this.rendererMeta.doExecuteOperation(name, null, this.page);
  }
}
