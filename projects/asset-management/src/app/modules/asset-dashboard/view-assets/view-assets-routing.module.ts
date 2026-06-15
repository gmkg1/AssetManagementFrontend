import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ViewAssetsComponent } from './view-assets.component';



const routes:Routes = [
    {
        path:'',
        component:ViewAssetsComponent,
        data:{
            breadcrumb:{
                module:'KJUSYS',
                subModule: 'view-assets',
                url: 'asset-management/view-assets'
            },
            submenu:true,
        }
    }
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ViewAssetsModuleRoutingModule {}
