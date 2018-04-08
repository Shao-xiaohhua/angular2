import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderTpl } from './common-tpl.component'

/**
 * 公共模板模块
 * 富文本占位符
 */
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    HeaderTpl
  ],
  exports: [
    HeaderTpl
  ]
})

export class CommonTplModule {}
