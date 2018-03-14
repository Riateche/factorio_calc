import { Injectable } from '@angular/core';
import { Config } from './config';

const localStorageKey: string = "factorio_calc_data_v1";

export interface Settings {
  defaultAssembler: string;
  defaultFurnace: string;
  defaultDrill: string;
  defaultFuel: string;
  gameVersion: string;
  generateMWInputs: boolean;
  miningProductivity: number;
}

@Injectable()
export class ConfigService {
  private _allConfigs: Array<Config> = [];
  private _settings: Settings = {
    defaultAssembler: "assembling-machine-2",
    defaultFurnace: "stone-furnace",
    defaultDrill: "electric-mining-drill",
    defaultFuel: "coal",
    gameVersion: "0.16",
    generateMWInputs: true,
    miningProductivity: 100
  };


  constructor() {
    let data = JSON.parse(localStorage.getItem(localStorageKey));
    if (data) {
      this._allConfigs = data.configs.map(c => Config.fromJson(c));
      this._settings = Object.assign(this._settings, data.settings);
    }
  }

  settings() : Settings {
    return Object.assign({}, this._settings);
  }

  setSettings(v: Settings) {
    this._settings = v;
    this.save();
  }

  allConfigs() : Array<Config> {
    return this._allConfigs;
  }

  newConfig() {
    let id: number = 1;
    while(this.configByName(`config${id}`)) {
      id++;
    }
    let config: Config = new Config(`config${id}`);
    this._allConfigs.push(config);
    this.save();
    return config;
  }

  updateConfig(name: string, config: Config) {
    for(let i in this._allConfigs) {
      if (this._allConfigs[i].name == name) {
        this._allConfigs[i] = config;
        break;
      }
    }
    this.save();
  }

  configByName(name: string) : Config {
    return this._allConfigs.find(c => c.name == name);
  }

  deleteConfig(name: string) {
    this._allConfigs = this._allConfigs.filter(c => c.name != name);
    this.save();
  }

  private save() {
    let data = {
      configs: this._allConfigs.map(c => c.toJson()),
      settings: this._settings
    };
    localStorage.setItem(localStorageKey, JSON.stringify(data));
  }


}
