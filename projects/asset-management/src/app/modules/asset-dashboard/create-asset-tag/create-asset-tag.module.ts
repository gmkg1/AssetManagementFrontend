import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CreateAssetTagModuleRoutingModule } from './create-asset-tag-routing.module';
import { CreateAssetTagComponent } from './create-asset-tag.component';


@NgModule({
  declarations: [
    CreateAssetTagComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CreateAssetTagModuleRoutingModule
  ]
})
export class CreateAssetTagModule { }
