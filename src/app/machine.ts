import { GameData } from "./game-data";


let supportedTypes: Array<string> = [
  'matter-source',
  'matter-sink',
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


export class Machine {
  type: string = "";
  recipe: string = "";


  clone() : Machine {
    var r = new Machine();
    r.type = this.type;
    r.recipe = this.recipe;
    return r;
  }

  clear() {
    this.type = "";
    this.recipe = "";
  }

  static fromJson(data: any) : Machine {
    var r = new Machine();
    r.type = data.type;
    r.recipe = data.recipe;
    return r;
  }

  test1() {
    return this.type + "!";
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
}
