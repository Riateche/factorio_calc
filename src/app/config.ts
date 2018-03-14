import { Machine } from './machine';
import { runEmulator, GlobalEmulatorResult } from './emulator';

export class Config {
  name: string = "";
  title: string = "";
  machines: Array<Machine> = [];
  emulatorResult: GlobalEmulatorResult;

  constructor(name?: string) {
    this.name = name;
  }

  clone() : Config {
    var r = new Config(this.name);
    r.title = this.title;
    r.machines = this.machines.map(m => m.clone());
    return r;
  }

  copyFrom(other: Config) {
    this.title = other.title;
    this.machines = other.machines.map(m => m.clone());
    this.emulatorResult = null;
  }
  static fromJson(data: any) : Config {
    var r = new Config();
    r.setFromJson(data);
    return r;
  }

  setFromJson(data: any) {
    this.name = data.name;
    this.title = data.title;
    this.machines = data.machines.map(m => Machine.fromJson(m));
  }

  toJson() : any {
    return {
      name: this.name,
      title: this.title,
      machines: this.machines.filter(m => !m.isAutoAdded).map(m => m.toJson()),
    };
  }

  displayName() : string {
    if (this.title != "") {
      return this.title;
    } else {
      return this.name;
    }
  }

  runEmulator() {
    this.autoAddSourcesAndSinks();
    this.emulatorResult = runEmulator(this.machines);
  }

  autoAddSourcesAndSinks() {
    this.machines = this.machines.filter(m => !m.isAutoAdded);
    let allInputs = {};
    for(let i = 0; i < this.machines.length; i++) {
      for(let item in this.machines[i].maxInput || {}) {
        allInputs[item] = true;
      }
    }
    let allOutputs = {};
    for(let i = 0; i < this.machines.length; i++) {
      for(let item in this.machines[i].maxOutput || {}) {
        allOutputs[item] = true;
      }
    }
    for(let item in allInputs) {
      if (!allOutputs[item]) {
        let machine = new Machine();
        machine.type = "matter-source";
        machine.recipe = item;
        machine.count = 100;
        machine.isAutoAdded = true;
        this.machines.push(machine);
      }
    }
    for(let item in allOutputs) {
      if (!allInputs[item]) {
        let machine = new Machine();
        machine.type = "matter-sink";
        machine.recipe = item;
        machine.count = 100;
        machine.isAutoAdded = true;
        this.machines.push(machine);
      }
    }




  }

  get jsonContent() : string {
    return JSON.stringify(this.toJson());
  }
  set jsonContent(v: string) {
    this.setFromJson(JSON.parse(v));
  }


}
