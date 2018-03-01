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
      this.createOption("rocket-silo"),
      DropdownOption.newSeparator(),
      DropdownOption.newTitle('Crafting recipes')
    ];
    for (let recipe of GameData.current().recipes) {
      this.allTypes.push(this.createOption(recipe.name));
    }
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
