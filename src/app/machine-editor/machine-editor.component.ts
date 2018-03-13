import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Machine, recipeCategoryToMachineTypes } from '../machine';
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
      DropdownOption.newTitle('Sources and sinks'),
      new DropdownOption({ value: 'matter-source', text: 'matter-source', icon: 'assets/icons/item-source.png' }),
      new DropdownOption({ value: 'matter-sink', text: 'matter-sink', icon: 'assets/icons/item-void.png' }),
      this.createOption("electric-mining-drill"),
      this.createOption("burner-mining-drill"),
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
      this.createOption("rocket-silo")
    ];
    this.allTypesAndRecipes = this.allTypes.concat(
      DropdownOption.newSeparator(),
      DropdownOption.newTitle('Crafting recipes')
    );
    for (let recipe of gameData.recipes) {
      this.allTypesAndRecipes.push(this.createOption(recipe.name));
      let machines = recipeCategoryToMachineTypes[recipe.category];
      for(let machine of machines) {
        this.recipesPerType[machine] = this.recipesPerType[machine] || [];
        this.recipesPerType[machine].push(this.createOption(recipe.name));
      }

    }
    this.allTypesAndRecipes.push(DropdownOption.newTitle('Resources'));
    for(let item of gameData.allItemsNotRecipeNames) {
      this.allTypesAndRecipes.push(this.createOption(item));
    }
    this.allTypesAndRecipes.push(this.createOption("MW"));

    let allItems = [];
    for(let item of gameData.allItems) {
      allItems.push(this.createOption(item));
    }
    allItems.push(this.createOption("MW"));
    this.recipesPerType["matter-source"] = allItems;
    this.recipesPerType["matter-sink"] = allItems;
    this.recipesPerType["electric-mining-drill"] =
      [ "iron-ore", "copper-ore", "coal", "stone", "uranium-ore"]
      .map(item => this.createOption(item));
    this.recipesPerType["burner-mining-drill"] =
      [ "iron-ore", "copper-ore", "coal", "stone"]
      .map(item => this.createOption(item));




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
    let iconName = name;
    if ((new RegExp('^empty-.*-barrel$')).test(name)) {
      iconName = "barrel-empty";
    } else if ((new RegExp('^fill-.*-barrel$')).test(name)) {
      iconName = "barrel-fill";
    }
    return new DropdownOption({
      icon: `assets/game_icons/${iconName}.png`,
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


}
