import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ConfigsComponent } from './configs/configs.component';
import { AppRoutingModule } from './/app-routing.module';
import { ConfigEditorComponent } from './config-editor/config-editor.component';


@NgModule({
  declarations: [
    AppComponent,
    ConfigsComponent,
    ConfigEditorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
