import * as recipes_0_16_json from './recipes/recipes-0.16.json';

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


  static itemIconPath(name: string) : string {
    let iconName = name;
    if ((new RegExp('^empty-.*-barrel$')).test(name)) {
      iconName = "barrel-empty";
    } else if ((new RegExp('^fill-.*-barrel$')).test(name)) {
      iconName = "barrel-fill";
    }
    return `assets/game_icons/${iconName}.png`;
  }

}
