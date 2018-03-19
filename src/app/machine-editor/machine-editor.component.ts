import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Machine } from '../machine';
import { DropdownOption } from '../dropdown/dropdown.component';
import { GameData } from '../game-data';
import { DropdownListsService } from '../dropdown-lists.service';
import { ConfigService } from '../config.service';
import { EmulatorResult } from '../emulator';

export class ActiveMachine {
  machine: Machine;
  emulatorResult: EmulatorResult;
  maxInput: {[key: string]: number} = {};
  maxOutput: {[key: string]: number} = {};

  constructor(m: Machine) {
    this.machine = m;
  }
}


class Module {
  private _type: string = "";
  component: MachineEditorComponent;
  constructor(type: string, component: MachineEditorComponent) {
    this._type = type;
    this.component = component;
  }

  get type() : string {
    return this._type;
  }
  set type(v: string) {
    this._type = v;
    this.component.applyModules();
  }
}

@Component({
  selector: 'machine-editor',
  templateUrl: './machine-editor.component.html',
  styleUrls: ['./machine-editor.component.css']
})
export class MachineEditorComponent implements OnInit {
  private _machine: ActiveMachine;
  gameData: GameData;
  errorString: string = "";
  modules: Array<Module> = [];

  get machine() : ActiveMachine {
    return this._machine;
  }
  @Input() set machine(m: ActiveMachine) {
    this._machine = m;
    this.fixModules();
    this.updateMaxIO();
  }
  @Output() onDeleteRequested = new EventEmitter<void>();

  get type() : string {
    return this.machine.machine.type;
  }
  set type(v: string) {
    this.machine.machine.type = v;
    this.fixModules();
    this.updateMaxIO();
  }
  get count() : number {
    return this.machine.machine.count;
  }
  set count(v: number) {
    this.machine.machine.count = v;
    this.updateMaxIO();
  }
  get recipe() : string {
    return this.machine.machine.recipe;
  }
  set recipe(v: string) {
    this.machine.machine.recipe = v;
    this.updateMaxIO();
  }
  get fuel() : string {
    return this.machine.machine.fuel;
  }
  set fuel(v: string) {
    this.machine.machine.fuel = v;
    this.updateMaxIO();
  }
  get creativeSpeed() : number {
    return this.machine.machine.creativeSpeed;
  }
  set creativeSpeed(v: number) {
    this.machine.machine.creativeSpeed = v;
    this.updateMaxIO();
  }
  updateMaxIO() {
    console.log("updateMaxIO");
    this.errorString = "";
    try {
      let r = this.gameData.updateMaxIO(this.machine.machine, this.configService.settings());
      this.machine.maxInput = r.maxInput;
      this.machine.maxOutput = r.maxOutput;
    } catch(e) {
      this.errorString = (e as Error).message;
    }
  }


  constructor(private dropdownLists: DropdownListsService, private configService: ConfigService) {
    this.gameData = GameData.current();
  }

  ngOnInit() {
  }



  hasAnyKey(value: any) {
    for(let x in value) {
      return true;
    }
    return false;

  }

  setRecommendedCount() {
    this.count = this.machine.emulatorResult.recommendedCount;
  }

  allReplaceOptions() {
    let r = [];
    let recipes = this.gameData.recipes.filter(r =>
      r.products.find(p => p.name == this.machine.machine.recipe) != null);
    for(let recipe of recipes) {
      r.push(new DropdownOption({
        value: recipe.name,
        text: `craft for ${recipe.name}`,
        icon: this.gameData.itemIconPath(recipe.name)
      }));
    }
    if (this.gameData.recipesPerMachineType["electric-mining-drill"].indexOf(this.machine.machine.recipe) !== -1) {
      r.push(new DropdownOption({
        value: "electric-mining-drill",
        text: `electric-mining-drill for ${this.machine.machine.recipe}`,
        icon: this.gameData.itemIconPath(this.machine.machine.recipe)
      }));
    }
    r.push(new DropdownOption({
      value: "matter-source",
      text: `matter-source for ${this.machine.machine.recipe}`,
      icon: this.gameData.itemIconPath(this.machine.machine.recipe)
    }));
    return r;
  }

  doReplace(value: string) {
    this.machine.machine.isAutoAdded = false;
    if (value == "matter-source") {
      this.type = "matter-source";
    } else if (value == "electric-mining-drill" &&
               this.gameData.recipesPerMachineType["electric-mining-drill"].indexOf(this.machine.machine.recipe) !== -1) {
      this.type = "electric-mining-drill";
      this.count = 1;
    } else {
      this.gameData.setRecipe(value, this.machine.machine, this.configService.settings());
      this.fixModules();
      this.updateMaxIO();
      this.count = 1;
    }
    if (this.machine.machine.hasFuel() && this.machine.machine.fuel === "") {
      this.fuel = this.configService.settings().defaultFuel;
    }
  }


  isCreative() {
    return this.machine.machine.type == "matter-source" || this.machine.machine.type == "matter-sink";
  }

  fixModules() {
    // console.log(this.machine);
    let targetCount = this.machine.machine.moduleSlots();
    while(this.machine.machine.modules.length < targetCount) {
      this.machine.machine.modules.push("");
    }
    this.machine.machine.modules = this.machine.machine.modules.slice(0, targetCount);
    this.modules = this.machine.machine.modules.map(m => new Module(m, this));

  }
  applyModules() {
    this.machine.machine.modules = this.modules.map(m => m.type);
    this.updateMaxIO();
  }


}
