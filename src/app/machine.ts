export class Machine {
  type: string = "";


  clone() : Machine {
    var r = new Machine();
    r.type = this.type;
    return r;
  }

  static fromJson(data: any) : Machine {
    var r = new Machine();
    r.type = data.type;
    return r;
  }

  test1() {
    return this.type + "!";
  }
}
