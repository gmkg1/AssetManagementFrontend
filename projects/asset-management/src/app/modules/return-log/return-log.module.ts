import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReturnLogModuleRoutingModule } from './return-log-routing.module';
import { ReturnLogComponent } from './return-log.component';


@NgModule({
  declarations: [
    ReturnLogComponent
  ],
  imports: [
    CommonModule,
    ReturnLogModuleRoutingModule
  ]
})
export class ReturnLogModule { }
