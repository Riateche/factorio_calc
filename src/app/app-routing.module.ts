import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigsComponent } from './configs/configs.component';
import { ConfigEditorComponent } from './config-editor/config-editor.component';
import { RouteService } from './route.service';


const routes: Routes = [
  { path: RouteService.CONFIGS_ROUTE, component: ConfigsComponent },
  { path: RouteService.CONFIG_ROUTE, component: ConfigEditorComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  providers: [ RouteService ]
})
export class AppRoutingModule {}

