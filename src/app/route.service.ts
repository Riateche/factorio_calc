import { Injectable } from '@angular/core';
import { Config } from './config';
import { RouterModule, Routes } from '@angular/router';

@Injectable()
export class RouteService {

  constructor() {
  }

  static CONFIG_ROUTE = 'config/:name';
  config(config: Config): string {
    return `/config/${config.name}`;
  }
  static CONFIGS_ROUTE = '';
  configs() {
    return '/';
  }
  static SETTINGS_ROUTE = 'settings';
  settings () {
    return '/settings';
  }

}
