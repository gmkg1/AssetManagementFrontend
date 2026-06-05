import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from '@libs/tabs';

import { AssetDashboardModuleRoutingModule } from './asset-dashboard-routing.module';
import { AssetDashboardComponent } from './asset-dashboard.component';
import { BreadcrumbsTitleComponent } from '@libs/shared-ui';


@NgModule({
  declarations: [
    AssetDashboardComponent
  ],
  imports: [
    CommonModule,
    TabsModule,
    AssetDashboardModuleRoutingModule,
    BreadcrumbsTitleComponent
  ]
})
export class AssetDashboardModule { }
