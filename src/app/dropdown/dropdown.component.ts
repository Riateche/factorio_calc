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



  constructor() {
  }

  ngOnInit() {
  }

  toggleActive() {
    this.is_active = !this.is_active;
  }
  setActive(value: boolean) {
    this.is_active = value;
    if (value) {
      setTimeout(() => this.inputElement.nativeElement.focus(), 100);
    }
    this.valueChange.emit(this.value);

    //this.is_active = true;
  }
  setCurrentOption(option: DropdownOption) {
    if (option.is_separator || option.is_title) { return; }
    this.value = option.value;
    this.valueChange.emit(this.value);

  }

  visibleOptions(): Array<DropdownOption> {

    if (!this.options.find(option => option.value.indexOf(this.value) !== -1 && !option.is_title)) {
      return [];
    }
    return this.options.filter(
      option => option.is_separator || option.is_title || option.value.indexOf(this.value) !== -1);
  }
  currentIcon() : string {
    let option = this.options.find(option => option.value == this.value);
    if (option) {
      return option.icon;
    } else {
      return "";
    }
  }
}
