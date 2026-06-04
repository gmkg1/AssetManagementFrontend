import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReturnLogModuleRoutingModule } from './return-log-routing.module';
import { ReturnLogComponent } from './return-log.component';


@NgModule({
  declarations: [
    ReturnLogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReturnLogModuleRoutingModule
  ]
})
export class ReturnLogModule { }
