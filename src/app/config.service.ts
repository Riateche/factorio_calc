import { Injectable } from '@angular/core';
import { Config } from './config';

const localStorageKey: string = "factorio_calc_configs_v1";

@Injectable()
export class ConfigService {
  private m_allConfigs: Array<Config> = [new Config("config1"), new Config("config2"), new Config("config3")];

  constructor() { 
    let data = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    this.m_allConfigs = data.map(c => Config.fromJson(c));
  }

  allConfigs() : Array<Config> {
    return this.m_allConfigs;
  }

  newConfig() {
    let id: number = 1;
    while(this.configByName(`config${id}`)) {
      id++;
    }
    let config: Config = new Config(`config${id}`);
    this.m_allConfigs.push(config);
    this.save();
    return config;
  }

  updateConfig(name: string, config: Config) {
    for(let i in this.m_allConfigs) {
      if (this.m_allConfigs[i].name == name) {
        this.m_allConfigs[i] = config;
        break;
      }
    }
    this.save();
  }

  configByName(name: string) : Config {
    return this.m_allConfigs.find(c => c.name == name);
  }

  deleteConfig(name: string) {
    this.m_allConfigs = this.m_allConfigs.filter(c => c.name != name);
    this.save();    
  }

  private save() {
    localStorage.setItem(localStorageKey, JSON.stringify(this.m_allConfigs));
  }


}
