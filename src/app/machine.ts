import { GameData } from "./game-data";


let supportedTypes: Array<string> = [
  "matter-source",
  "matter-sink",
  "electric-mining-drill",
  "burner-mining-drill",
  "assembling-machine-1",
  "assembling-machine-2",
  "assembling-machine-3",
  "stone-furnace",
  "steel-furnace",
  "electric-furnace",
  "oil-refinery",
  "chemical-plant",
  "centrifuge",
  "rocket-silo"
];

let recipeCategoryToMachineType = {
  "crafting": "assembling-machine-2",
  "crafting-with-fluid": "assembling-machine-2",
  "advanced-crafting": "assembling-machine-2",
  "chemistry": "chemical-plant",
  "oil-processing": "oil-refinery",
  "rocket-building": "rocket-silo",
  "smelting": "stone-furnace",
  "centrifuging": "centrifuge"
};

interface Module {
  type: string;
}

export class Machine {
  private _type: string = "";
  recipe: string = "";
  fuel: string = "";
  modules: Array<Module> = [];
  private _count: number = 1;

  get type() : string {
    return this._type;
  }
  set type(v: string) {
    this._type = v;
    this.fixModules();
  }

  get count() : number {
    return this._count;
  }
  set count(v: number) {
    console.log("v = ", v);
    if (typeof(v) == "string") {
      if (this.type === "matter-source" ||
          this.type === "matter-sink") {
        this._count = parseFloat(v as any as string);
      } else {
        this._count = parseInt(v as any as string);
      }
    } else {
      this._count = v;
    }
    console.log("count = ", this._count);
  }


  clone() : Machine {
    var r = new Machine();
    r.type = this.type;
    r.recipe = this.recipe;
    r.fuel = this.fuel;
    r.modules = this.modules.map(m => { return { type: m.type }; });
    r.count = this.count;
    return r;
  }

  clear() {
    this.type = "";
    this.recipe = "";
    this.fuel = "";
    this.modules = [];
    this.count = 1;
  }

  static fromJson(data: any) : Machine {
    // console.log("data", data);
    var r = new Machine();
    r.type = data.type;
    r.recipe = data.recipe;
    r.fuel = data.fuel;
    r.count = data.count;
    r.modules = data.modules.map(m => { return { type: m }; });
    // console.log("r", r);
    return r;
  }

  toJson() : any {
    return {
      type: this.type,
      recipe: this.recipe,
      fuel: this.fuel,
      modules: this.modules.map(m => m.type),
      count: this.count
    };
  }

  setTypeOrRecipe(typeOrRecipe: string) {
    this.clear();
    if (supportedTypes.indexOf(typeOrRecipe) !== -1) {
      this.type = typeOrRecipe;
    } else {
      let recipe = GameData.current().recipes.find(recipe => recipe.name == typeOrRecipe);
      if (!recipe) {
        alert("Unknown recipe");
        return;
      }
      if (!recipeCategoryToMachineType[recipe.category]) {
        alert("Unknown recipe category");
        return;
      }
      this.type = recipeCategoryToMachineType[recipe.category];
      this.recipe = typeOrRecipe;
    }
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

  private fixModules() {
    let targetCount = this.moduleSlots();
    while(this.modules.length < targetCount) {
      this.modules.push({ type: "" });
    }
    this.modules = this.modules.slice(0, targetCount);
  }
}
