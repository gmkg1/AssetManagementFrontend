import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewAssetsModuleRoutingModule } from './view-assets-routing.module';
import { ViewAssetsComponent } from './view-assets.component';


@NgModule({
  declarations: [
    ViewAssetsComponent
  ],
  imports: [
    CommonModule,
    ViewAssetsModuleRoutingModule
  ]
})
export class ViewAssetsModule { }
