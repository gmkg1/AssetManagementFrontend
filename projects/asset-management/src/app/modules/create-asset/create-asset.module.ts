import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CreateAssetModuleRoutingModule } from './create-asset-routing.module';
import { CreateAssetComponent } from './create-asset.component';


@NgModule({
  declarations: [
    CreateAssetComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CreateAssetModuleRoutingModule
  ]
})
export class CreateAssetModule { }
