import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetDashboardModuleRoutingModule } from './asset-dashboard-routing.module';
import { AssetDashboardComponent } from './asset-dashboard.component';


@NgModule({
  declarations: [
    AssetDashboardComponent
  ],
  imports: [
    CommonModule,
    AssetDashboardModuleRoutingModule
  ]
})
export class AssetDashboardModule { }
