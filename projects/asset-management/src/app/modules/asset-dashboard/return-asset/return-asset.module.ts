import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from '@libs/tabs';

import { ReturnAssetModuleRoutingModule } from './return-asset-routing.module';
import { ReturnAssetComponent } from './return-asset.component';


@NgModule({
  declarations: [
    ReturnAssetComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    ReturnAssetModuleRoutingModule
  ]
})
export class ReturnAssetModule { }
