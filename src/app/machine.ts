import { GameData } from "./game-data";
import { Settings } from "./config.service";





export class Machine {
  count: number = 1;
  type: string = "";
  recipe: string = "";
  fuel: string = "";
  creativeSpeed: number = 1;
  modules: Array<string> = [];
  isAutoAdded: boolean = false;


  // get count() : number {
  //   var r;
  //   if (this.type === "matter-source" ||
  //       this.type === "matter-sink") {
  //     r = parseFloat(this._countText);
  //   } else {
  //     r = parseInt(this._countText);
  //   }
  //   if (r != r) {
  //     return 1;
  //   } else {
  //     return r;
  //   }
  // }
  // set count(v: number) {
  //   this._countText = v.toString();
  //   this.updateProperties();
  // }

  // get countText() : string {
  //   return this._countText;
  // }
  // set countText(v: string) {
  //   this._countText = v;
  //   this.updateProperties();
  // }


  clone() : Machine {
    var r = new Machine();
    r.type = this.type;
    r.recipe = this.recipe;
    r.fuel = this.fuel;
    r.modules = this.modules.map(m => m);
    r.count = this.count;
    r.isAutoAdded = this.isAutoAdded;
    r.creativeSpeed = this.creativeSpeed;

    return r;
  }

  clear() {
    this.type = "";
    this.recipe = "";
    this.fuel = "";
    this.modules = [];
    this.count = 1;
    this.isAutoAdded = false;
    this.creativeSpeed = 1;
  }

  static fromJson(data: any) : Machine {
    var r = new Machine();
    r.type = data.type;
    r.recipe = data.recipe;
    r.fuel = data.fuel;
    r.count = data.count;
    r.modules = data.modules;
    r.creativeSpeed = data.creativeSpeed;
    return r;
  }

  toJson() : any {
    return {
      type: this.type,
      recipe: this.recipe,
      fuel: this.fuel,
      modules: this.modules,
      count: this.count,
      creativeSpeed: this.creativeSpeed
    };
  }


  hasFuel() : boolean {
    return this.type == "burner-mining-drill" ||
      this.type == "stone-furnace" ||
      this.type == "steel-furnace";
  }

  moduleSlots() : number {
    switch(this.type) {
      case "matter-source":
      case "matter-sink":
        return 0;
      case "electric-mining-drill":
        return 3;
      case "burner-mining-drill":
        return 0;
      case "assembling-machine-1":
      case "assembling-machine-2":
      case "assembling-machine-3":
        return 4;
      case "stone-furnace":
      case "steel-furnace":
        return 0;
      case "electric-furnace":
        return 2;
      case "oil-refinery":
      case "chemical-plant":
        return 3;
      case "centrifuge":
        return 2;
      case "rocket-silo":
        return 4;
    }
  }

}
