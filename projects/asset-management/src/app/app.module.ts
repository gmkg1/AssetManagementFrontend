import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './modules/navigation/navigation.component';
import { SharedAuthModule } from '@libs/shared-auth';
import { LeftMenuLibModule } from '@libs/left-menu-lib';
import { MenuHeaderLibModule } from '@libs/menu-header-lib';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    StoreModule.forRoot(
      {},
      {
        runtimeChecks: {
          strictStateImmutability: false,
          strictActionImmutability: false,
        },
      }
    ),
    EffectsModule.forRoot([]),
    SharedAuthModule,
    LeftMenuLibModule,
    MenuHeaderLibModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
