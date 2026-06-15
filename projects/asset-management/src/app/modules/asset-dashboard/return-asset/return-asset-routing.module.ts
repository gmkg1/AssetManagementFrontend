import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ReturnAssetComponent } from './return-asset.component';



const routes:Routes = [
    {
        path:'',
        component:ReturnAssetComponent,
        data:{
            breadcrumb:{
                module:'KJUSYS',
                subModule: 'return-asset',
                url: 'asset-management/return-asset'
            },
            submenu:true,
        }
    }
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReturnAssetModuleRoutingModule {}
