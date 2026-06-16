import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { IssueAssetComponent } from './issue-asset.component';



const routes:Routes = [
    {
        path:'',
        component:IssueAssetComponent,
        data:{
            breadcrumb:{
                module:'KJUSYS',
                subModule: 'issue-asset',
                url: 'asset-management/issue-asset'
            },
            submenu:true,
        }
    }
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class IssueAssetModuleRoutingModule {}
