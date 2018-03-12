import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'items-speed',
  templateUrl: './items-speed.component.html',
  styleUrls: ['./items-speed.component.css']
})
export class ItemsSpeedComponent implements OnInit {
  @Input() value: any;

  constructor() { }

  ngOnInit() {
  }

  valueAsList() {
    let x = [];
    for(let key in this.value) {
      if (Math.abs(this.value[key]) > 0.001) {
        x.push({ item: key, speed: this.value[key]});
      }
    }
    // console.log("ok1", this.value, x);
    return x;
  }


  itemIcon(item: string) : string {
    let iconName = item;
    if ((new RegExp('^empty-.*-barrel$')).test(item)) {
      iconName = "barrel-empty";
    } else if ((new RegExp('^fill-.*-barrel$')).test(item)) {
      iconName = "barrel-fill";
    }
    return `assets/game_icons/${iconName}.png`;
  }

}
