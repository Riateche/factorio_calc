import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ConfigsComponent } from './configs/configs.component';
import { AppRoutingModule } from './/app-routing.module';
import { ConfigEditorComponent } from './config-editor/config-editor.component';
import { ConfigService } from './config.service';
import { FormsModule } from '@angular/forms';
import { MachineEditorComponent } from './machine-editor/machine-editor.component';

@NgModule({
  declarations: [
    AppComponent,
    ConfigsComponent,
    ConfigEditorComponent,
    MachineEditorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [ConfigService],
  bootstrap: [AppComponent]
})
export class AppModule { }
