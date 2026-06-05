import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EditAssetModuleRoutingModule } from './edit-asset-routing.module';
import { EditAssetComponent } from './edit-asset.component';


@NgModule({
  declarations: [
    EditAssetComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    EditAssetModuleRoutingModule
  ]
})
export class EditAssetModule { }
