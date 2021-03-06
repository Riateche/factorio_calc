import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ConfigsComponent } from './configs/configs.component';
import { AppRoutingModule } from './/app-routing.module';
import { ConfigEditorComponent } from './config-editor/config-editor.component';
import { ConfigService } from './config.service';
import { FormsModule } from '@angular/forms';
import { MachineEditorComponent } from './machine-editor/machine-editor.component';
import { SortablejsModule } from 'angular-sortablejs';
import { TempComponent } from './temp/temp.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { ItemsSpeedComponent } from './items-speed/items-speed.component';
import { SettingsComponent } from './settings/settings.component';
import { DropdownListsService } from './dropdown-lists.service';

@NgModule({
  declarations: [
    AppComponent,
    ConfigsComponent,
    ConfigEditorComponent,
    MachineEditorComponent,
    TempComponent,
    DropdownComponent,
    ItemsSpeedComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    SortablejsModule.forRoot({ animation: 200, handle: ".sortableHandle" })
  ],
  providers: [ConfigService, DropdownListsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
