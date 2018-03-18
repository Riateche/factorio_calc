import { Machine } from './machine';

export class Config {
  id: number = 0;
  title: string = "";
  machines: Array<Machine> = [];

  clone() : Config {
    var r = new Config();
    r.title = this.title;
    r.machines = this.machines.map(m => m.clone());
    return r;
  }

  copyFrom(other: Config) {
    this.title = other.title;
    this.machines = other.machines.map(m => m.clone());
  }
  static fromJson(data: any) : Config {
    var r = new Config();
    r.setFromJson(data);
    return r;
  }

  setFromJson(data: any) {
    this.title = data.title;
    this.machines = data.machines.map(m => Machine.fromJson(m));
  }

  toJson() : any {
    return {
      title: this.title,
      machines: this.machines.filter(m => !m.isAutoAdded).map(m => m.toJson()),
    };
  }

  displayName() : string {
    if (this.title != "") {
      return this.title;
    } else {
      return `Config ${this.id + 1}`;
    }
  }


  autoAddSourcesAndSinks() {
    this.machines = this.machines.filter(m => !m.isAutoAdded);
    let allInputs = {};
    for(let i = 0; i < this.machines.length; i++) {
      for(let item in this.machines[i].maxInput || {}) {
        allInputs[item] = allInputs[item] || 0;
        allInputs[item] += this.machines[i].maxInput[item];
      }
    }
    let allOutputs = {};
    for(let i = 0; i < this.machines.length; i++) {
      for(let item in this.machines[i].maxOutput || {}) {
        allOutputs[item] = allOutputs[item] || 0;
        allOutputs[item] += this.machines[i].maxOutput[item];
      }
    }
    for(let item in allInputs) {
      if (!allOutputs[item]) {
        let machine = new Machine();
        machine.type = "matter-source";
        machine.recipe = item;
        machine.count = allInputs[item] * 1.01;
        machine.isAutoAdded = true;
        this.machines.push(machine);
      }
    }
    for(let item in allOutputs) {
      if (!allInputs[item]) {
        let machine = new Machine();
        machine.type = "matter-sink";
        machine.recipe = item;
        machine.count = allOutputs[item] * 1.01;
        machine.isAutoAdded = true;
        this.machines.push(machine);
      }
    }
  }
}
