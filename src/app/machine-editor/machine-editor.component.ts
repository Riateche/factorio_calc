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
  allRecipes: Array<DropdownOption> = [];
  allTypesAndRecipes: Array<DropdownOption> = [];
  allFuelTypes: Array<DropdownOption> = [];
  allModuleTypes: Array<DropdownOption> = [];

  constructor() {
    this.allTypes = [
      DropdownOption.newTitle('Sources and sinks'),
      new DropdownOption({ value: 'matter-source', icon: 'assets/icons/item-source.png' }),
      new DropdownOption({ value: 'matter-sink', icon: 'assets/icons/item-void.png' }),
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
    for (let recipe of GameData.current().recipes) {
      this.allRecipes.push(this.createOption(recipe.name));
    }
    this.allTypesAndRecipes = this.allTypes.concat(
      DropdownOption.newSeparator(),
      DropdownOption.newTitle('Crafting recipes'),
      this.allRecipes);

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
    return new DropdownOption({ icon: `assets/game_icons/${iconName}.png`, value: name });
  }


}
