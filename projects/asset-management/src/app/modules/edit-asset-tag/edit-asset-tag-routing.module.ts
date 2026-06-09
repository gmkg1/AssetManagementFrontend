import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { EditAssetTagComponent } from './edit-asset-tag.component';

const routes: Routes = [
  {
    path: '',
    component: EditAssetTagComponent,
    data: {
      breadcrumb: {
        module: 'KJUSYS',
        subModule: 'edit-asset-tag',
        url: 'asset-management/edit-asset-tag',
      },
      submenu: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditAssetTagRoutingModule {}
