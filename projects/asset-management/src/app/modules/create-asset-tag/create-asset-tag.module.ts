import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateAssetTagModuleRoutingModule } from './create-asset-tag-routing.module';
import { CreateAssetTagComponent } from './create-asset-tag.component';


@NgModule({
  declarations: [
    CreateAssetTagComponent
  ],
  imports: [
    CommonModule,
    CreateAssetTagModuleRoutingModule
  ]
})
export class CreateAssetTagModule { }
