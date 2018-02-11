import { Injectable } from '@angular/core';
import { Config } from './config';

@Injectable()
export class ConfigService {
  private m_allConfigs: Array<Config> = [new Config("config1"), new Config("config2"), new Config("config3")];

  constructor() { }

  allConfigs() : Array<Config> {
    return this.m_allConfigs;
  }

  newConfig() {
    let id: number = 1;
    while(this.configByName(`config${id}`)) {
      id++;
    }
    let config: Config = new Config(`config${id}`);
    config.title = `Config ${id}`;
    this.m_allConfigs.push(config);
    this.save();
    return config;
  }

  configByName(name: string) : Config {
    return this.m_allConfigs.find(c => c.name == name);
  }

  deleteConfig(name: string) {
    this.m_allConfigs = this.m_allConfigs.filter(c => c.name != name);
    this.save();    
  }

  private save() {
    //...
  }


}
