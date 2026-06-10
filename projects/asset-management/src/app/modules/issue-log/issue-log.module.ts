import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from '@libs/tabs';
import { DropdownLibModule } from '@libs/dropdown-lib';
import { BreadcrumbsTitleComponent } from '@libs/shared-ui';

import { IssueLogModuleRoutingModule } from './issue-log-routing.module';
import { IssueLogComponent } from './issue-log.component';


@NgModule({
  declarations: [
    IssueLogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    DropdownLibModule,
    BreadcrumbsTitleComponent,
    IssueLogModuleRoutingModule
  ]
})
export class IssueLogModule { }
