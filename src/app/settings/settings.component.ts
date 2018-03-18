import { Component, OnInit } from '@angular/core';
import { Settings, ConfigService } from '../config.service';
import { Router } from '@angular/router';
import { RouteService } from '../route.service';
import { DropdownOption } from '../dropdown/dropdown.component';
import { DropdownListsService } from '../dropdown-lists.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settings: Settings;

  constructor(private configService: ConfigService, private router: Router, public routes: RouteService, public dropdownLists: DropdownListsService) { }

  ngOnInit() {
    this.settings = this.configService.settings();
  }

  save() {
    this.configService.setSettings(this.settings);
    this.router.navigate([this.routes.configs()]);
  }

}
