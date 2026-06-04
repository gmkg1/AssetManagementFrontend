import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetDashboardModuleRoutingModule } from './asset-dashboard-routing.module';
import { AssetDashboardComponent } from './asset-dashboard.component';
import { BreadcrumbsTitleComponent } from '@libs/shared-ui';


@NgModule({
  declarations: [
    AssetDashboardComponent
  ],
  imports: [
    CommonModule,
    AssetDashboardModuleRoutingModule,
    BreadcrumbsTitleComponent
  ]
})
export class AssetDashboardModule { }
