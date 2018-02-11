export class Config {
  name: string;
  title: string = "";

  constructor(name?: string) {
    this.name = name;
  }

  clone() : Config {
    var r = new Config(this.name);
    r.title = this.title;
    return r;
  }

  static fromJson(json: string) : Config {
    return Object.assign(new Config(), json);
  }

  displayName() : string {
    if (this.title != "") {
      return this.title;
    } else {
      return this.name;
    }
  }
}
