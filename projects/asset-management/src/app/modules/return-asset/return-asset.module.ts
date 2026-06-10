import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from '@libs/tabs';
import { AlertsModule } from '@libs/alert';
import { BreadcrumbsTitleComponent } from '@libs/shared-ui';

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
    AlertsModule,
    BreadcrumbsTitleComponent,
    ReturnAssetModuleRoutingModule
  ]
})
export class ReturnAssetModule { }
