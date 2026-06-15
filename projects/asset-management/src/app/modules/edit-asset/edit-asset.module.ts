import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownLibModule } from '@libs/dropdown-lib';
import { AlertsModule } from '@libs/alert';
import { BreadcrumbsTitleComponent } from '@libs/shared-ui';

import { EditAssetModuleRoutingModule } from './edit-asset-routing.module';
import { EditAssetComponent } from './edit-asset.component';


@NgModule({
  declarations: [EditAssetComponent],
  imports: [
    CommonModule, FormsModule, DropdownLibModule, AlertsModule,
    BreadcrumbsTitleComponent, EditAssetModuleRoutingModule
  ]
})
export class EditAssetModule { }
