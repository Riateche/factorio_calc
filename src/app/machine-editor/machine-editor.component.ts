import { Component, OnInit, Input } from '@angular/core';
import { Machine } from '../machine';

@Component({
  selector: 'machine-editor',
  templateUrl: './machine-editor.component.html',
  styleUrls: ['./machine-editor.component.css']
})
export class MachineEditorComponent implements OnInit {
  @Input() machine: Machine;

  constructor() { }

  ngOnInit() {
  }

}
