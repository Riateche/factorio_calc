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
  id: number
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
    let idParam = this.route.snapshot.paramMap.get("id");
    if (idParam === "new") {
      this.id = null;
      this.config = new Config();
    } else {
      this.id = parseInt(idParam);
      var config = this.configService.configById(this.id);
      if (!config) {
        alert(`Config not found: ${idParam}`)
        this.router.navigate([this.routes.configs()]);
        return;
      }
      this.config = config.clone();
    }


  }

  deleteConfig() {
    if (!confirm("Delete this config?")) {
      return;
    }
    this.configService.deleteConfig(this.id);
    this.router.navigate([this.routes.configs()]);
  }

  save() {
    this.configService.addOrUpdateConfig(this.id, this.config);
    this.id = this.config.id;
    alert("Saved.");
    //this.router.navigate([this.routes.configs()]);
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
  saveCopy() {
    let newConfig = new Config();
    newConfig.copyFrom(this.config);
    newConfig.title = `${this.config.title} (copy)`;
    this.configService.addOrUpdateConfig(null, newConfig);
    alert("Copy saved.");
  }
}
