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

}
