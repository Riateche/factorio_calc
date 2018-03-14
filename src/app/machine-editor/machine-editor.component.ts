import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Machine } from '../machine';
import { DropdownOption } from '../dropdown/dropdown.component';
import { GameData } from '../game-data';
@Component({
  selector: 'machine-editor',
  templateUrl: './machine-editor.component.html',
  styleUrls: ['./machine-editor.component.css']
})
export class MachineEditorComponent implements OnInit {
  @Input() machine: Machine;
  @Output() onDeleteRequested = new EventEmitter<void>();

  allTypes: Array<DropdownOption> = [];
  allTypesAndRecipes: Array<DropdownOption> = [];
  allFuelTypes: Array<DropdownOption> = [];
  allModuleTypes: Array<DropdownOption> = [];
  recipesPerType: {[type: string]: Array<DropdownOption>} = {};

  constructor() {
    let gameData = GameData.current();
    this.allTypes = [
      DropdownOption.newTitle('Creative'),
      this.createOption("matter-source"),
      this.createOption("matter-sink"),
      DropdownOption.newSeparator(),
      DropdownOption.newTitle('Crafting machines'),
      this.createOption("assembling-machine-1"),
      this.createOption("assembling-machine-2"),
      this.createOption("assembling-machine-3"),
      this.createOption("stone-furnace"),
      this.createOption("steel-furnace"),
      this.createOption("electric-furnace"),
      this.createOption("oil-refinery"),
      this.createOption("chemical-plant"),
      this.createOption("centrifuge"),
      this.createOption("rocket-silo"),
      DropdownOption.newTitle('Drills'),
      this.createOption("electric-mining-drill"),
      this.createOption("burner-mining-drill")
    ];
    this.allTypesAndRecipes = this.allTypes.concat(
      DropdownOption.newSeparator(),
      DropdownOption.newTitle('Crafting recipes')
    );
    for (let recipe of gameData.recipes) {
      this.allTypesAndRecipes.push(this.createOption(recipe.name));
    }
    for(let machine of gameData.machineTypes) {
      this.recipesPerType[machine] = gameData.recipesPerMachineType[machine]
        .map(item => this.createOption(item));
    }


    this.allTypesAndRecipes.push(DropdownOption.newTitle('Resources'));
    for(let item of gameData.allItemsNotRecipeNames) {
      this.allTypesAndRecipes.push(this.createOption(item));
    }

    //let allItems = gameData.allItems.map(item => this.createOption(item));


    this.allFuelTypes = [
      "coal",
      "solid-fuel",
      "rocket-fuel",
      "nuclear-fuel",
      "raw-wood",
      "wood",
      "small-electric-pole",
      "wooden-chest"
    ].map(name => this.createOption(name));

    this.allModuleTypes = [
      "speed-module",
      "speed-module-2",
      "speed-module-3",
      "effectivity-module",
      "effectivity-module-2",
      "effectivity-module-3",
      "productivity-module",
      "productivity-module-2",
      "productivity-module-3"
    ].map(name => this.createOption(name));
    this.allModuleTypes.unshift(new DropdownOption({
      value: "",
      text: "Empty",
      icon: "assets/game_icons/slot-icon-module.png"
    }));

  }

  ngOnInit() {
  }

  createOption(name: string) : DropdownOption {
    return new DropdownOption({
      icon: GameData.itemIconPath(name),
      value: name,
      text: name
    });
  }

  hasAnyKey(value: any) {
    for(let x in value) {
      return true;
    }
    return false;

  }

  setRecommendedCount() {
    this.machine.count = this.machine.recommendedCount();
    this.machine.emulatorResult = null;
  }

  allReplaceOptions() {
    let r = [];
    r.push(new DropdownOption({
      value: "matter-source",
      text: `matter-source for ${this.machine.recipe}`,
      icon: GameData.itemIconPath(this.machine.recipe)
    }));
    if (GameData.current().recipesPerMachineType["electric-mining-drill"].indexOf(this.machine.recipe) !== -1) {
      r.push(new DropdownOption({
        value: "electric-mining-drill",
        text: `electric-mining-drill for ${this.machine.recipe}`,
        icon: GameData.itemIconPath(this.machine.recipe)
      }));
    }
    let recipes = GameData.current().recipes.filter(r =>
      r.products.find(p => p.name == this.machine.recipe) != null);
    for(let recipe of recipes) {
      r.push(new DropdownOption({
        value: recipe.name,
        text: `craft for ${recipe.name}`,
        icon: GameData.itemIconPath(recipe.name)
      }));
    }
    return r;
  }

  doReplace(value: string) {
    if (value == "matter-source" || value == "electric-mining-drill") {
      this.machine.type = value;
    } else {
      this.machine.setTypeOrRecipe(value);
    }
    this.machine.isAutoAdded = false;
  }

}
