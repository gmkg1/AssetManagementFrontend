import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewAssetTagComponent } from './view-asset-tag.component';

const routes: Routes = [
  {
    path: '',
    component: ViewAssetTagComponent,
    data: {
      breadcrumb: {
        module: 'KJUSYS',
        subModule: 'view-asset-tag',
        url: 'asset-management/view-asset-tag',
      },
      submenu: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewAssetTagRoutingModule {}
