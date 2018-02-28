import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Machine } from '../machine';

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

}
