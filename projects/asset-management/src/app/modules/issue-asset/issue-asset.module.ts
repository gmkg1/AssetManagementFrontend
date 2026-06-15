import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PillTabsModule } from '@libs/pill-tabs';
import { AlertsModule } from '@libs/alert';
import { BreadcrumbsTitleComponent } from '@libs/shared-ui';

import { IssueAssetModuleRoutingModule } from './issue-asset-routing.module';
import { IssueAssetComponent } from './issue-asset.component';


@NgModule({
  declarations: [IssueAssetComponent],
  imports: [
    CommonModule, FormsModule, PillTabsModule, AlertsModule,
    BreadcrumbsTitleComponent, IssueAssetModuleRoutingModule
  ]
})
export class IssueAssetModule { }
