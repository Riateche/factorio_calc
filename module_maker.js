var COAL_ENERGY = 8;
var TB_MAX = 13.3;

/*
function new_machine(item, count, extra) {
  return $.extend({ item: item, count: count || 1}, extra);
}

function multiply_machines(machines, num) {
  return $.map(machines, function(x) { return { item: x.item, count: x.count * num }; });
}

function dedup_machines(machines) {
  var obj = {};
  for(var i = 0; i < machines.length; i++) {
    obj[machines[i].item] = (obj[machines[i].item] || 0) + machines[i].count;
  }
  var r = [];
  for(item in obj) {
    r.push({ item: item, count: obj[item] });
  }
  return r;
}
*/

function make_ideal_counts(modules) {
  var e = emulator();
  e.add_group("g1");
  e.groups.g1.modules = modules;
  for(var iteration = 0; iteration < 100; iteration++) {
    total_steps = 0;

    e.calc_with_full_caching();
    var result = e.last_calc_step_result().modules;
    var any_not_loaded = false;
    var max_load_index = -1;
    var max_load;
    //console.log("searching for max load");
    for(var i = 0; i < modules.length; i++) {
      if (result[i].load < 1.0 - THR) {
        any_not_loaded = true;
      }
      if ((max_load_index < 0 || max_load < result[i].load)) {
        max_load = result[i].load;
        max_load_index = i;
        //console.log("max_load:", max_load, max_load_index);
      }
    }
    if (any_not_loaded && max_load_index >= 0) {
      modules[max_load_index].count = (modules[max_load_index].count || 1) + 1;
    } else {
      e.display();
      return;
    }
  }
  throw "make_ideal_counts: max iterations reached";
}

// config:
//   type - type of machine;
//   item: name of output item (if applicable)
//   count: scales all values; default = 1
//   speed: scales input and output rate; default = 1
//   productivity: scales output rate; default = 1
//   energy_consumption: scales energy consumption
// + type-specific settings
var create_module = function(config) {
  if (!config.count) { config.count = 1; }
  if (!config.speed) { config.speed = 1; }
  if (!config.productivity) { config.productivity = 1; }
  if (!config.energy_consumption) { config.energy_consumption = 1; }

  var module = {};
  module.machine_count = config.count;
  module.input = {};
  module.output = {};
  module.energy_consumption = 0;
  module.energy_drain = 0;


  if (config.type == "matter-source") {
    module.output[config.item] = 1;
    module.name = "Source of " + item_icon(config.item);
  } else if (config.type == "electric-mining-drill") { // settings: item
    var speed = {
      "iron-ore": 0.525,
      "copper-ore": 0.525,
      "coal": 0.525,
      "stone": 0.65,
      "uranium-ore": 0.2625
    }[config.item];
    if (!speed) {
      throw "error: unknown drill target";
    }
    module.name = config.count.toString() + " " + item_icon("electric-mining-drill") + " ⟶ " + item_icon(config.item);
    module.output[config.item] = speed;
    if (config.item == "uranium-ore") {
      module.input["sulfuric-acid"] = 0.2625;
    }
    module.energy_consumption = 0.09;
    module.energy_drain = 0;
  } else if (config.type == "burner-mining-drill") { // settings: item
    var speed = {
      "iron-ore": 0.28,
      "copper-ore": 0.28,
      "coal": 0.28,
      "stone": 0.3675,
    }[config.item];
    if (!speed) {
      throw "error: unknown drill target";
    }
    module.name = config.count.toString() + " " + item_icon("burner-mining-drill") + " ⟶ " + item_icon(config.item);
    module.output[config.item] = speed;
    module.input["coal"] = 0.3 / COAL_ENERGY;
    /*
  } else if (config.type == "boiler") { // no settings
    module.name = config.count.toString() + " " + item_icon("boiler");
    module.input["coal"] = 0.78 / COAL_ENERGY * config.count;
    module.output["water-energy"] = 0.78 * config.count / 2;
  } else if (config.type == "steam-engine") { // no settings
    module.name = config.count.toString() + " " + item_icon("steam-engine");
    module.input["water-energy"] = 0.51 * config.count;
    module.energy_consumption = -0.51 * config.count;
    module.energy_drain = 0;
  } else if (config.type == "energy-module") { // no settings
    module.name = config.count.toString() + " × (14 " + item_icon("boiler") + " + 10 " + item_icon("steam-engine") + ")";
    module.input["coal"] = 1.27 * config.count;
    module.energy_consumption = -5.1 * config.count;
    module.energy_drain = 0; */
  } else if ({
    "assembling-machine-1": true,
    "assembling-machine-2": true,
    "assembling-machine-3": true,
    "oil-refinery": true,
    "chemical-plant": true,
    "stone-furnace": true,
    "steel-furnace": true,
    "electric-furnace": true,
    "centrifuge": true,
    "rocket-silo": true,
    "crafter": true
  }[config.type]) {
    var recipe;
    for(var i = 0; i < factorio_recipes.length; i++) {
      if (factorio_recipes[i].name == config.item) {
        recipe = factorio_recipes[i];
        break;
      }
    }
    if (!recipe) {
      throw "error: recipe not found: " + config.item;
    }
    if (config.type == "crafter") {
      config.type = {
        "crafting": "assembling-machine-2",
        "crafting-with-fluid": "assembling-machine-2",
        "advanced-crafting": "assembling-machine-2",
        "chemistry": "chemical-plant",
        "oil-processing": "oil-refinery",
        "rocket-building": "rocket-silo",
        "smelting": "stone-furnace",
        "centrifuging": "centrifuge"
      }[recipe.category];
      if (!config.type) {
        throw "error: unknown recipe category: " + recipe.category;
      }
    }

    module.name = config.count.toString() + " " + item_icon(config.type) + " ⟶ " + item_icon(config.item);
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
    }[config.type];

    module.energy_consumption = {
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
    }[config.type];
    module.energy_drain = {
      "assembling-machine-1": 0.003,
      "assembling-machine-2": 0.005,
      "assembling-machine-3": 0.007,
      "oil-refinery": 0.014,
      "chemical-plant": 0.007,
      "stone-furnace": 0,
      "steel-furnace": 0,
      "electric-furnace": 0.006,
      "centrifuge": 0.0116,
      "rocket-silo": 0.0083
    }[config.type];
    if (config.type == "stone-furnace" || config.type == "steel-furnace") {
      module.input["coal"] = 0.18 / COAL_ENERGY;
    }

    var speed = machine_speed / recipe.energy;
    for(var j = 0; j < recipe.ingredients.length; j++) {
      var item = recipe.ingredients[j].name;
      var count = recipe.ingredients[j].amount;
      module.input[item] = count * speed;
    }
    for(var j = 0; j < recipe.products.length; j++) {
      var product = recipe.products[j];
      var item = product.name;
      var count;
      if (product.probability) {
        count = product.probability * product.amount_max;
      } else {
        count = product.amount;
      }
      module.output[item] = count * speed;
    }
  } else {
    throw "error: unknown module type";
  }

  for(key in module.input) {
    module.input[key] *= config.count * config.speed;
  }
  for(key in module.output) {
    module.output[key] *= config.count * config.speed * config.productivity;
  }
  module.energy_consumption *= config.count * config.energy_consumption;
  module.energy_drain *= config.count;
  return module;
}

function is_same_module(obj1, obj2) {
  for(var key in obj1) {
    if (key == "count") { continue; }
    if (obj1[key] != obj2[key]) { return false; }
  }
  for(var key in obj2) {
    if (key == "count") { continue; }
    if (obj1[key] != obj2[key]) { return false; }
  }
  return true;
}

