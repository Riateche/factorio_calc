import { Machine } from './machine';

export class Config {
  name: string = "";
  title: string = "";
  machines: Array<Machine> = [];

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
}
