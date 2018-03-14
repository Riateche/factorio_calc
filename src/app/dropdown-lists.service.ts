import { Injectable } from '@angular/core';
import { DropdownOption } from './dropdown/dropdown.component';
import { GameData } from './game-data';

@Injectable()
export class DropdownListsService {
  allTypes: Array<DropdownOption> = [];
  allTypesAndRecipes: Array<DropdownOption> = [];
  allFuelTypes: Array<DropdownOption> = [];
  allModuleTypes: Array<DropdownOption> = [];
  recipesPerType: {[type: string]: Array<DropdownOption>} = {};
  allAssemblers: Array<DropdownOption> = [];
  allFurnaces: Array<DropdownOption> = [];
  allDrills: Array<DropdownOption> = [];
  allGameVersions: Array<DropdownOption> = [];

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

    this.allAssemblers = ["assembling-machine-1", "assembling-machine-2", "assembling-machine-3"]
      .map(name => this.createOption(name));
    this.allFurnaces = ["stone-furnace", "steel-furnace", "electric-furnace", "matter-source"]
      .map(name => this.createOption(name));
    this.allDrills = ["electric-mining-drill", "burner-mining-drill", "matter-source"]
      .map(name => this.createOption(name));

    this.allGameVersions.push(new DropdownOption({
      text: "0.16",
      value: "0.16"
    }));



  }

  createOption(name: string) : DropdownOption {
    return new DropdownOption({
      icon: GameData.itemIconPath(name),
      value: name,
      text: name
    });
  }
}
