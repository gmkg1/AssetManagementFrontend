import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from '@libs/tabs';
import { DropdownLibModule } from '@libs/dropdown-lib';
import { BreadcrumbsTitleComponent } from '@libs/shared-ui';
import { TableModule } from '@libs/table';

import { ReturnLogModuleRoutingModule } from './return-log-routing.module';
import { ReturnLogComponent } from './return-log.component';


@NgModule({
  declarations: [
    ReturnLogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    DropdownLibModule,
    BreadcrumbsTitleComponent,
    TableModule,
    ReturnLogModuleRoutingModule
  ]
})
export class ReturnLogModule { }
