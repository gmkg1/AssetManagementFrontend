import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsTitleComponent } from '@libs/shared-ui';
import { TabsModule } from '@libs/tabs';
import { TableModule } from '@libs/table';

import { ViewAssetTagRoutingModule } from './view-asset-tag-routing.module';
import { ViewAssetTagComponent } from './view-asset-tag.component';

@NgModule({
  declarations: [ViewAssetTagComponent],
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    TableModule,
    ViewAssetTagRoutingModule,
    BreadcrumbsTitleComponent,
  ],
})
export class ViewAssetTagModule {}
