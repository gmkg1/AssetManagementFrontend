import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EditAssetTagRoutingModule } from './edit-asset-tag-routing.module';
import { EditAssetTagComponent } from './edit-asset-tag.component';

@NgModule({
  declarations: [EditAssetTagComponent],
  imports: [
    CommonModule,
    FormsModule,
    EditAssetTagRoutingModule,
  ],
})
export class EditAssetTagModule {}
