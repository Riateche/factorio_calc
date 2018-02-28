import { Component, OnInit, ViewChild, ElementRef, ContentChild, Input } from '@angular/core';


export class DropdownOption {
  value: string = "";
  icon: string = "";
  is_separator: boolean = false;

  constructor(properties?: any) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
  static newSeparator() : DropdownOption {
    return new DropdownOption({ is_separator: true });
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
  value: string = "";



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

    //this.is_active = true;
  }
  setCurrentOption(option: DropdownOption) {
    if (option.is_separator) { return; }
    this.value = option.value;

    //this.cdRef.detectChanges();
  }

  visibleOptions(): Array<DropdownOption> {

    if (!this.options.find(option => option.value.indexOf(this.value) !== -1)) {
      return [];
    }
    return this.options.filter(
      option => option.is_separator || option.value.indexOf(this.value) !== -1);
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
