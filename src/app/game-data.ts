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


let cache : GameData;

export class GameData {
  recipes: Array<Recipe> = [];
  allItems: Array<string> = [];
  allItemsNotRecipeNames : Array<string> = [];


  static current(): GameData {
    if (cache) { return cache; }
    let r = new GameData();
    r.recipes = recipes_0_16_json as any as Array<Recipe>;

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
    }
    r.allItems.sort();
    for(let name of r.allItems) {
      if (!recipeNames[name]) {
        r.allItemsNotRecipeNames.push(name);
      }
    }
    r.allItemsNotRecipeNames.sort();
    cache = r;
    return r;
  }

}
