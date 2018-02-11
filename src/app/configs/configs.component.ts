import { Component, OnInit } from '@angular/core';
import {Config } from '../config';
import { ConfigService } from '../config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'configs',
  templateUrl: './configs.component.html',
  styleUrls: ['./configs.component.css']
})
export class ConfigsComponent implements OnInit {
  configs: Array<Config>

  constructor(private configService: ConfigService, private router: Router) { 
    this.configs = this.configService.allConfigs();
  }

  addConfig() {
    var config = this.configService.newConfig();
    this.router.navigate(['config', config.name]);
  }

  ngOnInit() {
  }

}
