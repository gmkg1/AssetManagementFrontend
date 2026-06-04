import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IssueAssetModuleRoutingModule } from './issue-asset-routing.module';
import { IssueAssetComponent } from './issue-asset.component';


@NgModule({
  declarations: [
    IssueAssetComponent
  ],
  imports: [
    CommonModule,
    IssueAssetModuleRoutingModule
  ]
})
export class IssueAssetModule { }
