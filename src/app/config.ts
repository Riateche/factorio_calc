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

  static fromJson(data: any) : Config {
    var r = new Config(data.name);
    r.title = data.title;
    r.machines = data.machines.map(m => Machine.fromJson(m));
    return r;
  }

  toJson() : any {
    return {
      name: this.name,
      title: this.title,
      machines: this.machines.map(m => m.toJson()),
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


}
