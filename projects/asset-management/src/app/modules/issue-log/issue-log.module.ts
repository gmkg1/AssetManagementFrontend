import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IssueLogModuleRoutingModule } from './issue-log-routing.module';
import { IssueLogComponent } from './issue-log.component';


@NgModule({
  declarations: [
    IssueLogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IssueLogModuleRoutingModule
  ]
})
export class IssueLogModule { }
