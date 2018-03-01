import { Component, OnInit, ViewChild, ElementRef, ContentChild, Input, Output, EventEmitter } from '@angular/core';


export class DropdownOption {
  value: string = "";
  icon: string = "";
  is_separator: boolean = false;
  is_title: boolean = false;

  constructor(properties?: any) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
  static newSeparator() : DropdownOption {
    return new DropdownOption({ is_separator: true });
  }
  static newTitle(text: string) : DropdownOption {
    return new DropdownOption({ is_title: true, value: text });
  }
}

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit {
  @Input() options: Array<DropdownOption> = [];
  @Input() placeholder: string = "(unset)";
  @ViewChild("input") inputElement: ElementRef;
  is_active = false;
  @Input() value: string = "";
  @Output() valueChange: EventEmitter<String> = new EventEmitter<String>();
  currentText: string = "";



  constructor() {
  }

  ngOnInit() {
  }

  openEditor() {
    console.log("value at openEditor: ", this.value);
    this.is_active = true;
    this.currentText = "";
    setTimeout(() => this.inputElement.nativeElement.focus(), 100);
  }

  cancel() {
    this.is_active = false;
    this.currentText = "";
  }

  confirm() {
    if (this.currentText.length === 0) {
      this.value = "";
    } else {
      let option = this.options.find(option => option.value.indexOf(this.currentText) !== -1);
      if (option) {
        this.value = option.value;
      } else {
        this.value = this.currentText;
      }
    }
    this.valueChange.emit(this.value);
    this.cancel();
  }

  setCurrentOption(option: DropdownOption) {
    if (option.is_separator || option.is_title) { return; }
    this.value = option.value;
    this.valueChange.emit(this.value);
    this.cancel();
  }

  visibleOptions(): Array<DropdownOption> {
    if (!this.options.find(option => option.value.indexOf(this.currentText) !== -1 && !option.is_title)) {
      return [];
    }
    return this.options.filter(
      option => option.is_separator || option.is_title || option.value.indexOf(this.currentText) !== -1);
  }
  currentIcon() : string {
    let option = this.options.find(option => option.value == this.value);
    if (option) {
      return option.icon;
    } else {
      return "";
    }
  }
  inputKeyUp(event) {
    if (event.key == "Escape") {
      this.cancel();
    } else if (event.key == "Enter") {
      this.confirm();
    } else if (event.key == "ArrowDown") {
      //...
    }
  }
}
