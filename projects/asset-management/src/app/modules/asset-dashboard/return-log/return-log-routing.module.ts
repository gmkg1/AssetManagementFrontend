import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ReturnLogComponent } from './return-log.component';



const routes:Routes = [
    {
        path:'',
        component:ReturnLogComponent,
        data:{
            breadcrumb:{
                module:'KJUSYS',
                subModule: 'return-log',
                url: 'asset-management/return-log'
            },
            submenu:true,
        }
    }
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReturnLogModuleRoutingModule {}
