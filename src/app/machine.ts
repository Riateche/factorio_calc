import { GameData } from "./game-data";
import { EmulatorResult } from "./emulator"

/*! Returns number of items of `fuel` per second required to satisfy
  the given `energy` consumption (in MW).
*/
function calcBurnerInput(fuel: string, energy: number): number {
  let fuelValue = GameData.current().fuelValues[fuel];
  if (!fuelValue) {
    throw new Error("unknown fuel type");
  }
  return energy / fuelValue;
}

class Module {
  private _type: string = "";
  machine: Machine;
  constructor(type: string, machine: Machine) {
    this._type = type;
    this.machine = machine;
  }

  get type() : string {
    return this._type;
  }
  set type(v: string) {
    this._type = v;
    this.machine.updateProperties();
  }
}

export class Machine {
  private _type: string = "";
  private _recipe: string = "";
  private _fuel: string = "";
  modules: Array<Module> = [];
  private _countText: string = "1";
  maxInput: any = {};
  maxOutput: any = {};
  emulatorResult: EmulatorResult;
  errorString: string = "";
  isAutoAdded: boolean = false;

  get type() : string {
    return this._type;
  }
  set type(v: string) {
    this._type = v;
    this.fixModules();
    this.updateProperties();
  }

  get count() : number {
    var r;
    if (this.type === "matter-source" ||
        this.type === "matter-sink") {
      r = parseFloat(this._countText);
    } else {
      r = parseInt(this._countText);
    }
    if (r != r) {
      return 1;
    } else {
      return r;
    }
  }
  set count(v: number) {
    this._countText = v.toString();
    this.updateProperties();
  }

  get countText() : string {
    return this._countText;
  }
  set countText(v: string) {
    this._countText = v;
    this.updateProperties();
  }

  get recipe() : string {
    return this._recipe;
  }
  set recipe(v: string) {
    this._recipe = v;
    this.updateProperties();
  }
  get fuel() : string {
    return this._fuel;
  }
  set fuel(v: string) {
    this._fuel = v;
    this.updateProperties();
  }
  clone() : Machine {
    var r = new Machine();
    r.type = this.type;
    r.recipe = this.recipe;
    r.fuel = this.fuel;
    r.modules = this.modules.map(m => new Module(m.type, r));
    r.count = this.count;
    r.isAutoAdded = this.isAutoAdded;
    return r;
  }

  clear() {
    this.type = "";
    this.recipe = "";
    this.fuel = "";
    this.modules = [];
    this.count = 1;
    this.isAutoAdded = false;
  }

  static fromJson(data: any) : Machine {
    var r = new Machine();
    r.type = data.type;
    r.recipe = data.recipe;
    r.fuel = data.fuel;
    r.countText = data.count.toString();
    r.modules = data.modules.map(m => new Module(m, r));
    r.isAutoAdded = data.isAutoAdded;
    return r;
  }

  toJson() : any {
    return {
      type: this.type,
      recipe: this.recipe,
      fuel: this.fuel,
      modules: this.modules.map(m => m.type),
      count: this.count,
      isAutoAdded: this.isAutoAdded
    };
  }

  setTypeOrRecipe(typeOrRecipe: string) {
    this.clear();
    if (GameData.current().machineTypes.indexOf(typeOrRecipe) !== -1) {
      this.type = typeOrRecipe;
    } else {
      let recipe = GameData.current().recipes.find(recipe => recipe.name == typeOrRecipe);
      if (!recipe) {
        this.type = "matter-source";
        this.recipe = typeOrRecipe;
      } else {
        if (!GameData.current().recipeCategoryToMachineTypes[recipe.category]) {
          alert("Unknown recipe category");
          return;
        }
        this.type = GameData.current().recipeCategoryToMachineTypes[recipe.category][0];
        this.recipe = typeOrRecipe;
      }
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
      this.modules.push(new Module("", this));
    }
    this.modules = this.modules.slice(0, targetCount);
  }

  updateProperties() {
    this.errorString = "";
    try {
      this.maxInput = {};
      this.maxOutput = {};
      if (this.count <= 0) {
        throw new Error("invalid count");
      }
      if (this.type == "matter-source") {
        if (this.recipe !== "") {
          this.maxOutput[this.recipe] = 1;
        }
      } else if (this.type == "matter-sink") {
        if (this.recipe !== "") {
          this.maxInput[this.recipe] = 1;
        }
      } else if (this.type == "electric-mining-drill") {
        let speed = {
          "iron-ore": 0.525,
          "copper-ore": 0.525,
          "coal": 0.525,
          "stone": 0.65,
          "uranium-ore": 0.2625
        }[this.recipe];
        if (!speed) {
          throw new Error("unknown drill target");
        }
        this.maxOutput[this.recipe] = speed;
        if (this.recipe == "uranium-ore") {
          this.maxInput["sulfuric-acid"] = 0.2625;
        }
        this.maxInput["MW"] = 0.09;
      } else if (this.type == "burner-mining-drill") {
        let speed = {
          "iron-ore": 0.28,
          "copper-ore": 0.28,
          "coal": 0.28,
          "stone": 0.3675,
        }[this.recipe];
        if (!speed) {
          throw new Error("unknown drill target");
        }
        this.maxOutput[this.recipe] = speed;
        if (this.fuel === "") {
          throw new Error("fuel not set");
        }
        this.maxInput[this.fuel] = calcBurnerInput(this.fuel, 0.3);
      } else { // crafting machines
        if (this.recipe === '') {
          throw new Error(`recipe not set`);
        }
        let recipe = GameData.current().recipes.find(recipe => recipe.name == this.recipe);
        if (!recipe) {
          throw new Error(`recipe "${this.recipe}" not found`);
        }
        if (GameData.current().recipeCategoryToMachineTypes[recipe.category].indexOf(this.type) === -1) {
          throw new Error(`wrong machine type for recipe "${this.recipe}"`);
        }
        var machine_speed = {
          "assembling-machine-1": 0.5,
          "assembling-machine-2": 0.75,
          "assembling-machine-3": 1.25,
          "oil-refinery": 1,
          "chemical-plant": 1.25,
          "stone-furnace": 1,
          "steel-furnace": 2,
          "electric-furnace": 2,
          "centrifuge": 0.75,
          "rocket-silo": 1
        }[this.type];

        this.maxInput["MW"] = {
          "assembling-machine-1": 0.09,
          "assembling-machine-2": 0.15,
          "assembling-machine-3": 0.21,
          "oil-refinery": 0.42,
          "chemical-plant": 0.21,
          "stone-furnace": 0,
          "steel-furnace": 0,
          "electric-furnace": 0.18,
          "centrifuge": 0.35,
          "rocket-silo": 4
        }[this.type];
        if (this.type == "stone-furnace" || this.type == "steel-furnace") {
            if (this.fuel === "") {
              throw new Error("fuel not set");
            }
            this.maxInput[this.fuel] = calcBurnerInput(this.fuel, 0.18);
        }
        let speed = machine_speed / recipe.energy;
        for(let j = 0; j < recipe.ingredients.length; j++) {
          let item = recipe.ingredients[j].name;
          let count = recipe.ingredients[j].amount;
          this.maxInput[item] = count * speed;
        }
        for(let j = 0; j < recipe.products.length; j++) {
          let product = recipe.products[j];
          let item = product.name;
          let count;
          if (product.probability) {
            count = product.probability * product.amount_max;
          } else {
            count = product.amount;
          }
          this.maxOutput[item] = count * speed;
        }
      }

      let speedCoef = 1;
      let productivityCoef = 1;
      let energyConsumptionCoef = 1;

      for(let module of this.modules) {
        switch(module.type) {
          case "":
            break;
          case "speed-module":
            speedCoef += 0.2;
            energyConsumptionCoef += 0.5;
            break;
          case "speed-module-2":
            speedCoef += 0.3;
            energyConsumptionCoef += 0.6;
            break;
          case "speed-module-3":
            speedCoef += 0.5;
            energyConsumptionCoef += 0.7;
            break;
          case "effectivity-module":
            energyConsumptionCoef -= 0.3;
            break;
          case "effectivity-module-2":
            energyConsumptionCoef -= 0.4;
            break;
          case "effectivity-module-3":
            energyConsumptionCoef -= 0.5;
            break;
          case "productivity-module":
            productivityCoef += 0.04;
            break;
          case "productivity-module-2":
            productivityCoef += 0.06;
            break;
          case "productivity-module-3":
            productivityCoef += 0.1;
            break;
        }
      }
      if (energyConsumptionCoef < 0.2) {
        energyConsumptionCoef = 0.2;
      }

      for(let key in this.maxInput) {
        if (key === "MW") {
          this.maxInput[key] *= this.count * energyConsumptionCoef;
        } else {
          this.maxInput[key] *= this.count * speedCoef;
        }
      }
      for(let key in this.maxOutput) {
        this.maxOutput[key] *= this.count * speedCoef * productivityCoef;
      }
    } catch(e) {
      this.errorString = (e as Error).message;
    }
  }
}
