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

}
