import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from '@libs/tabs';
import { DropdownLibModule } from '@libs/dropdown-lib';
import { BreadcrumbsTitleComponent } from '@libs/shared-ui';

import { ReportsModuleRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';


@NgModule({
  declarations: [
    ReportsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    DropdownLibModule,
    BreadcrumbsTitleComponent,
    ReportsModuleRoutingModule
  ]
})
export class ReportsModule { }
