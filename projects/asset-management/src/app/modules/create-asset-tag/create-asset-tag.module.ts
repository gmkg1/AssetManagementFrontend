import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownLibModule } from '@libs/dropdown-lib';
import { AlertsModule } from '@libs/alert';
import { BreadcrumbsTitleComponent } from '@libs/shared-ui';

import { CreateAssetTagModuleRoutingModule } from './create-asset-tag-routing.module';
import { CreateAssetTagComponent } from './create-asset-tag.component';


@NgModule({
  declarations: [CreateAssetTagComponent],
  imports: [
    CommonModule, FormsModule, DropdownLibModule, AlertsModule,
    BreadcrumbsTitleComponent, CreateAssetTagModuleRoutingModule
  ]
})
export class CreateAssetTagModule { }
