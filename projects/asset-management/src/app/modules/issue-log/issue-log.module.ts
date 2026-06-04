import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IssueLogModuleRoutingModule } from './issue-log-routing.module';
import { IssueLogComponent } from './issue-log.component';


@NgModule({
  declarations: [
    IssueLogComponent
  ],
  imports: [
    CommonModule,
    IssueLogModuleRoutingModule
  ]
})
export class IssueLogModule { }
