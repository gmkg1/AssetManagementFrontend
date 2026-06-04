import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CreateAssetTagComponent } from './create-asset-tag.component';



const routes:Routes = [
    {
        path:'',
        component:CreateAssetTagComponent,
        data:{
            breadcrumb:{
                module:'KJUSYS',
                subModule: 'create-asset-tag',
                url: 'asset-management/create-asset-tag'
            },
            submenu:true,
        }
    }
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CreateAssetTagModuleRoutingModule {}
