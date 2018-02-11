export class Config {
  name: string;
  title: string;

  constructor(name: string) {
    this.name = name;
  }

  clone() : Config {
    var r = new Config(this.name);
    r.title = this.title;
    return r;
  }
}
