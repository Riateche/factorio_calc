import { Injectable } from '@angular/core';
import { Config } from './config';
import { RouterModule, Routes } from '@angular/router';

@Injectable()
export class RouteService {

  constructor() {
  }

  static CONFIG_ROUTE = 'config/:id';
  config(config: Config): string {
    return `/config/${config.id}`;
  }
  newConfig(): string {
    return '/config/new';
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
