import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownLibModule } from '@libs/dropdown-lib';
import { AlertsModule } from '@libs/alert';
import { BreadcrumbsTitleComponent } from '@libs/shared-ui';

import { CreateAssetModuleRoutingModule } from './create-asset-routing.module';
import { CreateAssetComponent } from './create-asset.component';


@NgModule({
  declarations: [CreateAssetComponent],
  imports: [
    CommonModule, FormsModule, DropdownLibModule, AlertsModule,
    BreadcrumbsTitleComponent, CreateAssetModuleRoutingModule
  ]
})
export class CreateAssetModule { }
