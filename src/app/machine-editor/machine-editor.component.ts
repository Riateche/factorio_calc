import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Machine } from '../machine';
import { DropdownOption } from '../dropdown/dropdown.component';
import { GameData } from '../game-data';
import { DropdownListsService } from '../dropdown-lists.service';
import { ConfigService } from '../config.service';
@Component({
  selector: 'machine-editor',
  templateUrl: './machine-editor.component.html',
  styleUrls: ['./machine-editor.component.css']
})
export class MachineEditorComponent implements OnInit {
  private _machine: Machine;
  gameData: GameData;

  get machine() : Machine {
    return this._machine;
  }
  @Input() set machine(m: Machine) {
    this._machine = m;
    this.machine.globalSettings = this.configService.settings();
    this.machine.updateProperties();
  }
  @Output() onDeleteRequested = new EventEmitter<void>();

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
    this.machine.count = this.machine.emulatorResult.recommendedCount;
  }

  allReplaceOptions() {
    let r = [];
    let recipes = this.gameData.recipes.filter(r =>
      r.products.find(p => p.name == this.machine.recipe) != null);
    for(let recipe of recipes) {
      r.push(new DropdownOption({
        value: recipe.name,
        text: `craft for ${recipe.name}`,
        icon: GameData.itemIconPath(recipe.name)
      }));
    }
    if (this.gameData.recipesPerMachineType["electric-mining-drill"].indexOf(this.machine.recipe) !== -1) {
      r.push(new DropdownOption({
        value: "electric-mining-drill",
        text: `electric-mining-drill for ${this.machine.recipe}`,
        icon: GameData.itemIconPath(this.machine.recipe)
      }));
    }
    r.push(new DropdownOption({
      value: "matter-source",
      text: `matter-source for ${this.machine.recipe}`,
      icon: GameData.itemIconPath(this.machine.recipe)
    }));
    return r;
  }

  doReplace(value: string) {
    this.machine.isAutoAdded = false;
    if (value == "matter-source" || value == "electric-mining-drill") {
      this.machine.type = value;
    } else {
      this.setTypeOrRecipe(value);
    }
    if (this.machine.hasFuel() && this.machine.fuel === "") {
      this.machine.fuel = this.configService.settings().defaultFuel;
    }
  }

  setTypeOrRecipe(typeOrRecipe: string) {
    this.machine.clear();
    if (this.gameData.machineTypes.indexOf(typeOrRecipe) !== -1) {
      this.machine.type = typeOrRecipe;
    } else {
      let recipe = this.gameData.recipes.find(recipe => recipe.name == typeOrRecipe);
      if (!recipe) {
        if (this.gameData.recipesPerMachineType["electric-mining-drill"].indexOf(typeOrRecipe) !== -1) {
          this.machine.type = this.configService.settings().defaultDrill;
        } else {
          this.machine.type = "matter-source";
        }
        this.machine.recipe = typeOrRecipe;
      } else {
        if (!this.gameData.recipeCategoryToMachineTypes[recipe.category]) {
          alert("Unknown recipe category");
          return;
        }
        let machineType = this.gameData.recipeCategoryToMachineTypes[recipe.category][0];
        if (machineType == "assembling-machine-1") {
          machineType = this.configService.settings().defaultAssembler;
        } else if (machineType == "stone-furnace") {
          machineType = this.configService.settings().defaultFurnace;
        }
        this.machine.type = machineType;
        this.machine.recipe = typeOrRecipe;
      }
    }
    if (this.machine.hasFuel() && this.machine.fuel === "") {
      this.machine.fuel = this.configService.settings().defaultFuel;
    }
  }

  isCreative() {
    return this.machine.type == "matter-source" || this.machine.type == "matter-sink";
  }

}
