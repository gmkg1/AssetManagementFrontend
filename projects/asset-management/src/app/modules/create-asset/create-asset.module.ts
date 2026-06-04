import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateAssetModuleRoutingModule } from './create-asset-routing.module';
import { CreateAssetComponent } from './create-asset.component';


@NgModule({
  declarations: [
    CreateAssetComponent
  ],
  imports: [
    CommonModule,
    CreateAssetModuleRoutingModule
  ]
})
export class CreateAssetModule { }
