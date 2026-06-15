import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { IssueLogComponent } from './issue-log.component';



const routes:Routes = [
    {
        path:'',
        component:IssueLogComponent,
        data:{
            breadcrumb:{
                module:'KJUSYS',
                subModule: 'issue-log',
                url: 'asset-management/issue-log'
            },
            submenu:true,
        }
    }
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class IssueLogModuleRoutingModule {}
