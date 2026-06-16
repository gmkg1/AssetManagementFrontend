import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { EditAssetComponent } from './edit-asset.component';



const routes:Routes = [
    {
        path:'',
        component:EditAssetComponent,
        data:{
            breadcrumb:{
                module:'KJUSYS',
                subModule: 'edit-asset',
                url: 'asset-management/edit-asset'
            },
            submenu:true,
        }
    }
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EditAssetModuleRoutingModule {}
