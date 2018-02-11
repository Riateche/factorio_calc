import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigsComponent } from './configs/configs.component';
import { ConfigEditorComponent } from './config-editor/config-editor.component';


const routes: Routes = [
  { path: '', component: ConfigsComponent },
  { path: 'config/:name', component: ConfigEditorComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
