import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TabsModule } from '@libs/tabs';

import { AssetDashboardModuleRoutingModule } from './asset-dashboard-routing.module';
import { AssetDashboardComponent } from './asset-dashboard.component';
import { BreadcrumbsTitleComponent } from '@libs/shared-ui';
import { CreateAssetComponent } from './create-asset/create-asset.component';
import { CreateAssetTagComponent } from './create-asset-tag/create-asset-tag.component';
import { EditAssetComponent } from './edit-asset/edit-asset.component';
import { EditWarrantyLicensesComponent } from './edit-warranty-licenses/edit-warranty-licenses.component';
import { IssueAssetComponent } from './issue-asset/issue-asset.component';
import { IssueLogComponent } from './issue-log/issue-log.component';
import { ReportsComponent } from './reports/reports.component';
import { ReturnAssetComponent } from './return-asset/return-asset.component';
import { ReturnLogComponent } from './return-log/return-log.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewAssetsComponent } from './view-assets/view-assets.component';


@NgModule({
  declarations: [
    AssetDashboardComponent,
    CreateAssetComponent,
    CreateAssetTagComponent,
    EditAssetComponent,
    EditWarrantyLicensesComponent,
    IssueAssetComponent,
    IssueLogComponent,
    ReportsComponent,
    ReturnAssetComponent,
    ReturnLogComponent,
    DashboardComponent,
    ViewAssetsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TabsModule,
    AssetDashboardModuleRoutingModule,
    BreadcrumbsTitleComponent
  ]
})
export class AssetDashboardModule { }
