import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReturnAssetModuleRoutingModule } from './return-asset-routing.module';
import { ReturnAssetComponent } from './return-asset.component';


@NgModule({
  declarations: [
    ReturnAssetComponent
  ],
  imports: [
    CommonModule,
    ReturnAssetModuleRoutingModule
  ]
})
export class ReturnAssetModule { }
