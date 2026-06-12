import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CreateAssetComponent } from './create-asset.component';



const routes:Routes = [
    {
        path:'',
        component:CreateAssetComponent,
        data:{
            breadcrumb:{
                module:'KJUSYS',
                subModule: 'create-asset',
                url: 'asset-management/create-asset'
            },
            submenu:true,
        }
    }
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CreateAssetModuleRoutingModule {}
