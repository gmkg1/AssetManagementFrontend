import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsTitleComponent } from '@libs/shared-ui';

import { ViewAssetsModuleRoutingModule } from './view-assets-routing.module';
import { ViewAssetsComponent } from './view-assets.component';


@NgModule({
  declarations: [
    ViewAssetsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ViewAssetsModuleRoutingModule,
    BreadcrumbsTitleComponent
  ]
})
export class ViewAssetsModule { }
