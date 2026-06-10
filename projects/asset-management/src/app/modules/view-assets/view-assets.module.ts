import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsTitleComponent } from '@libs/shared-ui';
import { TableModule } from '@libs/table';
import { TabsModule } from '@libs/tabs';
import { DropdownLibModule } from '@libs/dropdown-lib';

import { ViewAssetsModuleRoutingModule } from './view-assets-routing.module';
import { ViewAssetsComponent } from './view-assets.component';


@NgModule({
  declarations: [
    ViewAssetsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    DropdownLibModule,
    ViewAssetsModuleRoutingModule,
    BreadcrumbsTitleComponent,
    TableModule
  ]
})
export class ViewAssetsModule { }
