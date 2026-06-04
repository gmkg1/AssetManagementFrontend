import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditAssetModuleRoutingModule } from './edit-asset-routing.module';
import { EditAssetComponent } from './edit-asset.component';


@NgModule({
  declarations: [
    EditAssetComponent
  ],
  imports: [
    CommonModule,
    EditAssetModuleRoutingModule
  ]
})
export class EditAssetModule { }
