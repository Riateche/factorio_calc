import * as recipes_0_16_json from './recipes/recipes-0.16.json';

export class RecipeIngredient {
  name: string;
  /** "item" or "fluid" */
  type: string;
  amount: number;

  probability: number;
  amount_min: number;
  amount_max: number;
}

export class Recipe {
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

export class GameData {
  recipes: Array<Recipe>;

  static current(): GameData {
    let r = new GameData();
    r.recipes = recipes_0_16_json;
    return r;
  }
}
