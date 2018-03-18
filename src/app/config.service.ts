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
      this.updateIds();
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

  addOrUpdateConfig(id: number, config: Config) {
    if (id === null) {
      config.id = this._allConfigs.length;
      this._allConfigs.push(config);

    } else {
      if (id >= 0 && id < this._allConfigs.length) {
        config.id = id;
        this._allConfigs[id] = config;
      } else {
        alert("Invalid id");
      }
    }
    this.save();
  }

  configById(id: number) : Config {
    if (id >= 0 && id < this._allConfigs.length) {
      return this._allConfigs[id];
    } else {
      return null;
    }
  }

  deleteConfig(id: number) {
    if (id >= 0 && id < this._allConfigs.length) {
      this._allConfigs.splice(id, 1);
      this.updateIds();
      this.save();
    } else {
      alert("invalid id");
    }
  }

  private save() {
    let data = {
      configs: this._allConfigs.map(c => c.toJson()),
      settings: this._settings
    };
    localStorage.setItem(localStorageKey, JSON.stringify(data));
  }

  private updateIds() {
    for(let i = 0; i < this._allConfigs.length; i++) {
      this._allConfigs[i].id = i;
    }
  }
}
