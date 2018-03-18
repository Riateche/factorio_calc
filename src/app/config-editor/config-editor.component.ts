import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../config.service';
import { Config } from '../config';

import { RouteService } from '../route.service';
import { Machine } from '../machine';
import { DropdownListsService } from '../dropdown-lists.service';
import { GameData } from '../game-data';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-config-editor',
  templateUrl: './config-editor.component.html',
  styleUrls: ['./config-editor.component.css']
})
export class ConfigEditorComponent implements OnInit {
  originalConfigName: string
  config: Config
  showJsonContent: boolean = false;
  @ViewChild("addMachineDropdown") addMachineDropdown: DropdownComponent;

  toggleJsonContent() {
    this.showJsonContent = !this.showJsonContent;
  }

  constructor(private route: ActivatedRoute, private configService: ConfigService,
    private router: Router, private routes: RouteService,
    private dropdownLists: DropdownListsService)
  {
  }

  ngOnInit() {
    this.originalConfigName = this.route.snapshot.paramMap.get("name");
    var config = this.configService.configByName(this.originalConfigName);
    if (!config) {
      alert(`Config not found: ${this.originalConfigName}`)
      this.router.navigate([this.routes.configs()]);
      return;
    }
    this.config = config.clone();
  }

  deleteConfig() {
    if (!confirm("Delete this config?")) {
      return;
    }
    this.configService.deleteConfig(this.originalConfigName);
    this.router.navigate([this.routes.configs()]);
  }

  save() {
    console.log('test1', this.config);
    this.configService.updateConfig(this.originalConfigName, this.config);
    this.router.navigate([this.routes.configs()]);
  }

  addMachine(recipeName: string) {
    let machine = new Machine();
    GameData.current().setRecipe(recipeName, machine, this.configService.settings());

    let firstAutoSource = this.firstAutoSource();
    if (firstAutoSource) {
      let index = this.config.machines.indexOf(firstAutoSource);
      this.config.machines.splice(index, 0, machine);
    } else {
      this.config.machines.push(machine);
    }
    this.addMachineDropdown.value = "";
  }
  deleteMachine(machine: Machine) {
    if (!confirm("Delete this machine?")) { return; }
    this.config.machines.splice(this.config.machines.indexOf(machine), 1);
  }

  firstAutoSource() {
    return this.config.machines.find(m => m.isAutoAdded && m.type == "matter-source");
  }
  firstAutoSink() {
    return this.config.machines.find(m => m.isAutoAdded && m.type == "matter-sink");
  }
  duplicate() {
    let newConfig = this.configService.newConfig();
    newConfig.copyFrom(this.config);
    newConfig.title = `${this.config.title} (copy)`;
    this.configService.updateConfig(newConfig.name, newConfig);
    alert("Copy saved.");
  }
}
