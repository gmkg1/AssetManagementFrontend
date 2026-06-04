import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AssetDashboardComponent } from './asset-dashboard.component';



const routes:Routes = [
    {
        path:'',
        component:AssetDashboardComponent,
        data:{
            breadcrumb:{
                module:'KJUSYS',
                subModule: 'asset-dashboard',
                url: 'asset-management/asset-dashboard'
            },
            submenu:true,
        }
    }
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AssetDashboardModuleRoutingModule {}
