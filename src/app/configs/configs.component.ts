import { Component, OnInit } from '@angular/core';
import {Config } from '../config';

@Component({
  selector: 'configs',
  templateUrl: './configs.component.html',
  styleUrls: ['./configs.component.css']
})
export class ConfigsComponent implements OnInit {
  configs: Array<Config>

  constructor() { 
    this.configs = [new Config("config1"), new Config("config2"), new Config("config3")];
    console.log(this.configs);


  }

  addConfig() {
    
  }

  ngOnInit() {
  }

}
