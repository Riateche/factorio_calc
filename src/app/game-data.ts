import * as recipes_0_16_json from './recipes/recipes-0.16.json';
import { Machine } from './machine';
import { Settings } from './config.service';

export interface RecipeIngredient {
  name: string;
  /** "item" or "fluid" */
  type: string;
  amount: number;

  probability: number;
  amount_min: number;
  amount_max: number;
}

export interface Recipe {
  /** name of the product (if single) or name of the process */
  name: string;
  /** Possible values: "advanced-crafting", "centrifuging", "chemistry", "crafting",
   *  "crafting-with-fluid", "oil-processing", "rocket-building", "smelting" */
  category: string;
  /** Base crafting time in seconds */
  energy: number;
  ingredients: Array<RecipeIngredient>;
  products: Array<RecipeIngredient>;
}


let cache : GameData;

export interface MaxIO {
  maxInput: {[key: string]: number};
  maxOutput: {[key: string]: number};
}

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

export class GameData {
  recipes: Array<Recipe> = [];
  allItems: Array<string> = [];
  allItemsNotRecipeNames : Array<string> = [];
  fuelValues: {[key: string]: number} = {};
  recipeCategoryToMachineTypes: {[key: string]: Array<string>} = {};
  machineTypes: Array<string> = [];
  recipesPerMachineType: {[key: string]: Array<string>} = {};


  static current(): GameData {
    if (cache) { return cache; }
    let r = new GameData();
    r.recipes = recipes_0_16_json as any as Array<Recipe>;
    r.fuelValues = {
      // MJ per item
      "coal": 8,
      "solid-fuel": 25,
      "rocket-fuel": 225,
      "nuclear-fuel": 1210,
      "raw-wood": 4,
      "wood": 2,
      "small-electric-pole": 4,
      "wooden-chest": 4
    };
    r.recipeCategoryToMachineTypes = {
      "crafting": ["assembling-machine-1", "assembling-machine-2", "assembling-machine-3"],
      "crafting-with-fluid": ["assembling-machine-1", "assembling-machine-2", "assembling-machine-3"],
      "advanced-crafting": ["assembling-machine-1", "assembling-machine-2", "assembling-machine-3"],
      "chemistry": ["chemical-plant"],
      "oil-processing": ["oil-refinery"],
      "rocket-building": ["rocket-silo"],
      "smelting": ["stone-furnace", "steel-furnace", "electric-furnace"],
      "centrifuging": ["centrifuge"]
    };
    r.machineTypes = [
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
    let recipeNames = {};
    for(let recipe of r.recipes) {
      for(let ing of recipe.ingredients) {
        if (r.allItems.indexOf(ing.name) === -1) {
          r.allItems.push(ing.name);
        }
      }
      for(let ing of recipe.products) {
        if (r.allItems.indexOf(ing.name) === -1) {
          r.allItems.push(ing.name);
        }
      }
      recipeNames[recipe.name] = true;
      let machines = r.recipeCategoryToMachineTypes[recipe.category];
      for(let machine of machines) {
        r.recipesPerMachineType[machine] = r.recipesPerMachineType[machine] || [];
        r.recipesPerMachineType[machine].push(recipe.name);
      }
    }
    r.allItems.push("MW");
    r.allItems.sort();
    for(let name of r.allItems) {
      if (!recipeNames[name]) {
        r.allItemsNotRecipeNames.push(name);
      }
    }
    r.allItemsNotRecipeNames.sort();

    r.recipesPerMachineType["matter-source"] = r.allItems;
    r.recipesPerMachineType["matter-sink"] = r.allItems;
    r.recipesPerMachineType["electric-mining-drill"] =
      [ "iron-ore", "copper-ore", "coal", "stone", "uranium-ore"];
    r.recipesPerMachineType["burner-mining-drill"] =
      [ "iron-ore", "copper-ore", "coal", "stone"];

    cache = r;
    return r;
  }

  itemIconPath(name: string) : string {
    let iconName = name;
    if ((new RegExp('^empty-.*-barrel$')).test(name)) {
      iconName = "barrel-empty";
    } else if ((new RegExp('^fill-.*-barrel$')).test(name)) {
      iconName = "barrel-fill";
    }
    return `assets/game_icons/${iconName}.png`;
  }


  setRecipe(recipeName: string, machine: Machine, settings: Settings) {
    let recipe = this.recipes.find(recipe => recipe.name == recipeName);
    if (!recipe) {
      if (this.recipesPerMachineType["electric-mining-drill"].indexOf(recipeName) !== -1) {
        machine.type = settings.defaultDrill;
      } else {
        machine.type = "matter-source";
      }
      machine.recipe = recipeName;
    } else {
      if (!this.recipeCategoryToMachineTypes[recipe.category]) {
        alert("Unknown recipe category");
        return;
      }
      let machineType = this.recipeCategoryToMachineTypes[recipe.category][0];
      if (machineType == "assembling-machine-1") {
        machineType = settings.defaultAssembler;
      } else if (machineType == "stone-furnace") {
        machineType = settings.defaultFurnace;
      }
      machine.type = machineType;
      machine.recipe = recipeName;
    }
    if (machine.hasFuel() && machine.fuel === "") {
      machine.fuel = settings.defaultFuel;
    }
  }

  updateMaxIO(machine: Machine, settings: Settings): MaxIO {
    let maxInput = {};
    let maxOutput = {};
    if (machine.count <= 0) {
      throw new Error("invalid count");
    }
    if (machine.type == "matter-source") {
      machine.count = 1;
      if (machine.recipe !== "") {
        maxOutput[machine.recipe] = machine.creativeSpeed;
      }
    } else if (machine.type == "matter-sink") {
      machine.count = 1;
      if (machine.recipe !== "") {
        maxInput[machine.recipe] = machine.creativeSpeed;
      }
    } else if (machine.type == "electric-mining-drill") {
      let speed = {
        "iron-ore": 0.525,
        "copper-ore": 0.525,
        "coal": 0.525,
        "stone": 0.65,
        "uranium-ore": 0.2625
      }[machine.recipe];
      if (!speed) {
        throw new Error("unknown drill target");
      }
      maxOutput[machine.recipe] = speed;
      if (machine.recipe == "uranium-ore") {
        maxInput["sulfuric-acid"] = 0.2625;
      }
      maxInput["MW"] = 0.09;
    } else if (machine.type == "burner-mining-drill") {
      let speed = {
        "iron-ore": 0.28,
        "copper-ore": 0.28,
        "coal": 0.28,
        "stone": 0.3675,
      }[machine.recipe];
      if (!speed) {
        throw new Error("unknown drill target");
      }
      maxOutput[machine.recipe] = speed;
      if (machine.fuel === "") {
        throw new Error("fuel not set");
      }
      maxInput[machine.fuel] = calcBurnerInput(machine.fuel, 0.3);
    } else { // crafting machines
      if (machine.recipe === '') {
        throw new Error(`recipe not set`);
      }
      let recipe = GameData.current().recipes.find(recipe => recipe.name == machine.recipe);
      if (!recipe) {
        throw new Error(`recipe "${machine.recipe}" not found`);
      }
      if (GameData.current().recipeCategoryToMachineTypes[recipe.category].indexOf(machine.type) === -1) {
        throw new Error(`wrong machine type for recipe "${machine.recipe}"`);
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
      }[machine.type];

      maxInput["MW"] = {
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
      }[machine.type];
      if (machine.type == "stone-furnace" || machine.type == "steel-furnace") {
          if (machine.fuel === "") {
            throw new Error("fuel not set");
          }
          maxInput[machine.fuel] = calcBurnerInput(machine.fuel, 0.18);
      }
      let speed = machine_speed / recipe.energy;
      for(let j = 0; j < recipe.ingredients.length; j++) {
        let item = recipe.ingredients[j].name;
        let count = recipe.ingredients[j].amount;
        maxInput[item] = count * speed;
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
        maxOutput[item] = count * speed;
      }
    }

    let speedCoef = 1;
    let productivityCoef = 1;
    let energyConsumptionCoef = 1;

    for(let module of machine.modules) {
      switch(module) {
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
    if (settings) {
      if (machine.type == "electric-mining-drill" || machine.type == "burner-mining-drill") {
        productivityCoef += (settings.miningProductivity - 100) / 100;
      }
    }

    for(let key in maxInput) {
      if (key === "MW") {
        maxInput[key] *= machine.count * energyConsumptionCoef;
      } else {
        maxInput[key] *= machine.count * speedCoef;
      }
    }
    if (settings && !settings.generateMWInputs) {
      delete maxInput["MW"];
    }
    for(let key in maxOutput) {
      maxOutput[key] *= machine.count * speedCoef * productivityCoef;
    }
    return {
      maxInput: maxInput,
      maxOutput: maxOutput
    };
  }


}
