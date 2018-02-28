import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Machine } from '../machine';
import { DropdownOption } from '../dropdown/dropdown.component';

@Component({
  selector: 'machine-editor',
  templateUrl: './machine-editor.component.html',
  styleUrls: ['./machine-editor.component.css']
})
export class MachineEditorComponent implements OnInit {
  @Input() machine: Machine;
  @Output() onDeleteRequested = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  createOption(name: string) : DropdownOption {
    return new DropdownOption({ icon: `assets/game_icons/${name}.png`, value: name });
  }

  allTypes(): Array<DropdownOption> {
    return [
      this.createOption("assembling-machine-1"),
      this.createOption("assembling-machine-2"),
      this.createOption("assembling-machine-3"),
      DropdownOption.newSeparator(),
      this.createOption("burner-mining-drill"),
      this.createOption("electric-mining-drill")
    ];
  }

}
