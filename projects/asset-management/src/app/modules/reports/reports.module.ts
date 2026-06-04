import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsModuleRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';


@NgModule({
  declarations: [
    ReportsComponent
  ],
  imports: [
    CommonModule,
    ReportsModuleRoutingModule
  ]
})
export class ReportsModule { }
