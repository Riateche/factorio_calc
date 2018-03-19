import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../config.service';
import { Config } from '../config';

import { RouteService } from '../route.service';
import { Machine } from '../machine';
import { DropdownListsService } from '../dropdown-lists.service';
import { GameData } from '../game-data';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { runEmulator, GlobalEmulatorResult } from '../emulator';
import { ActiveMachine } from '../machine-editor/machine-editor.component';

@Component({
  selector: 'app-config-editor',
  templateUrl: './config-editor.component.html',
  styleUrls: ['./config-editor.component.css']
})
export class ConfigEditorComponent implements OnInit {
  id: number
  config: Config
  jsonContent: string = "";
  jsonContentVisible: boolean = false;
  machines: Array<ActiveMachine> = [];
  emulatorResult: GlobalEmulatorResult;

  @ViewChild("addMachineDropdown") addMachineDropdown: DropdownComponent;


  showJsonContent() {
    this.jsonContentVisible = true;
    this.jsonContent = JSON.stringify(this.config.toJson());
  }
  applyJsonContent() {
    try {
      this.config = Config.fromJson(JSON.parse(this.jsonContent));
      this.initConfig();
      this.jsonContentVisible = false;
    } catch(e) {
      alert(e);
    }
  }

  constructor(private route: ActivatedRoute, private configService: ConfigService,
    private router: Router, private routes: RouteService,
    private dropdownLists: DropdownListsService,
    private changeDetectorRef: ChangeDetectorRef)
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
    this.initConfig();
  }

  initConfig() {
    this.machines = this.config.machines.map(m => new ActiveMachine(m));
  }

  deleteConfig() {
    if (!confirm("Delete this config?")) {
      return;
    }
    this.configService.deleteConfig(this.id);
    this.router.navigate([this.routes.configs()]);
  }

  save() {
    this.config.machines = this.machines.map(m => m.machine);
    this.configService.addOrUpdateConfig(this.id, this.config);
    this.id = this.config.id;
    alert("Saved.");
    //this.router.navigate([this.routes.configs()]);
  }

  addMachine(recipeName: string) {
    let machine = new Machine();
    GameData.current().setRecipe(recipeName, machine, this.configService.settings());

    let activeMachine = new ActiveMachine(machine);

    let firstAutoSource = this.firstAutoSource();
    if (firstAutoSource) {
      let index = this.machines.indexOf(firstAutoSource);
      this.machines.splice(index, 0, activeMachine);
    } else {
      this.machines.push(activeMachine);
    }
    this.addMachineDropdown.value = "";
  }
  deleteMachine(machine: ActiveMachine) {
    if (!confirm("Delete this machine?")) { return; }
    this.machines.splice(this.machines.indexOf(machine), 1);
  }

  firstAutoSource(): ActiveMachine {
    return this.machines.find(m => m.machine.isAutoAdded && m.machine.type == "matter-source");
  }
  firstAutoSink(): ActiveMachine {
    return this.machines.find(m => m.machine.isAutoAdded && m.machine.type == "matter-sink");
  }
  saveCopy() {
    let newConfig = new Config();
    newConfig.copyFrom(this.config);
    newConfig.title = `${this.config.title} (copy)`;
    this.configService.addOrUpdateConfig(null, newConfig);
    alert("Copy saved.");
  }

  runEmulator() {
    this.autoAddSourcesAndSinks();
    // update max io for new machines
    this.changeDetectorRef.detectChanges();
    this.emulatorResult = runEmulator(this.machines);
  }


  autoAddSourcesAndSinks() {
    this.machines = this.machines.filter(m => !m.machine.isAutoAdded);
    let allInputs = {};
    for(let i = 0; i < this.machines.length; i++) {
      for(let item in this.machines[i].maxInput) {
        allInputs[item] = allInputs[item] || 0;
        allInputs[item] += this.machines[i].maxInput[item];
      }
    }
    let allOutputs = {};
    for(let i = 0; i < this.machines.length; i++) {
      for(let item in this.machines[i].maxOutput) {
        allOutputs[item] = allOutputs[item] || 0;
        allOutputs[item] += this.machines[i].maxOutput[item];
      }
    }
    for(let item in allInputs) {
      if (!allOutputs[item]) {
        let machine = new Machine();
        machine.type = "matter-source";
        machine.recipe = item;
        machine.creativeSpeed = allInputs[item] * 1.01;
        machine.isAutoAdded = true;
        this.machines.push(new ActiveMachine(machine));
      }
    }
    for(let item in allOutputs) {
      if (!allInputs[item]) {
        let machine = new Machine();
        machine.type = "matter-sink";
        machine.recipe = item;
        machine.creativeSpeed = allOutputs[item] * 1.01;
        machine.isAutoAdded = true;
        this.machines.push(new ActiveMachine(machine));
      }
    }
  }

}
