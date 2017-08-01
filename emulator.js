var emulator = function() {
  var emulator = {};
  emulator.groups = {};
  emulator.add_group = function(group_name) {
    var group = {};
    group.name = group_name;
    group.modules = [];
    group.storages = {};
    group.cache = {};
    group.add_items = function(items) {
      emulator.transfer_items("player", group_name, items);
    }
    group.create_items = function(items) {
      emulator.transfer_items(null, group_name, items);
    }
    group.take_items = function(items) {
      emulator.transfer_items(group_name, "player", items);
    }
    group.destroy_items = function(items) {
      emulator.transfer_items(group_name, null, items);
    }
    group.log_cache = function() {
      emulator.all_results.push({
        type: "cache",
        group_name: group_name,
        start_time: emulator.current_time,
        cache: $.extend({}, group.cache)
      });
    };
    group.build = function(modules, remove_items) {
      if (!$.isArray(modules)) {
        modules = [modules];
      }
      //var items_count = 0;
      var items = {};
      for(var i = 0; i < modules.length; i++) {
        //items_count += (modules[i].count || 1);
        items[modules[i].type] = (items[modules[i].type] || 0) + (modules[i].count || 1);
      }
      //var duration = items_count * 5;
      emulator.all_results.push({
        type: "build",
        group_name: group_name,
        start_time: emulator.current_time,
        modules: $.map(modules, function(m) { return create_module(m).name; })
        //duration: duration
      });
      //emulator.wait(duration, { no_wait_message: true });
      if (remove_items) {
        emulator.transfer_items("player", null, items, true);
      }
      for(var i = 0; i < modules.length; i++) {
        var found = false;
        for(var j = 0; j < group.modules.length; j++) {
          if (is_same_module(modules[i], group.modules[j])) {
            group.modules[j].count = (group.modules[j].count || 1) + modules[i].count;
            found = true;
            break;
          }
        }
        if (!found) {
          group.modules.push(modules[i]);
        }
      }
    }
    emulator.groups[group_name] = group;
  };
  emulator.all_results = [];
  emulator.current_time = 0;

  emulator.transfer_items = function(group_from, group_to, items, silent) {
    var not_enough_items = false;
    if (group_from) {
      for(var item in items) {
        emulator.groups[group_from].cache[item] = (emulator.groups[group_from].cache[item] || 0) - items[item];
        if (emulator.groups[group_from].cache[item] < -THR) {
          not_enough_items = true;
        }
      }
    }
    if (group_to) {
      for(var item in items) {
        emulator.groups[group_to].cache[item] = (emulator.groups[group_to].cache[item] || 0) + items[item];
      }
    }
    if (!silent || not_enough_items) {
      emulator.all_results.push({
        type: "transfer_items",
        start_time: emulator.current_time,
        items: $.extend({}, items),
        group_from: group_from,
        group_to: group_to,
        error: not_enough_items ? "Not enough items" : null
      });
    }
    if (group_from) { emulator.groups[group_from].log_cache(); }
    if (group_to) { emulator.groups[group_to].log_cache(); }
  };

  var was_full_caching = false;
  var prepare_full_caching = function() {
    was_full_caching = true;
    for(var group_name in emulator.groups) {
      var group = emulator.groups[group_name];
      if (group.modules.length == 0) { continue; }
      var all_inputs = {};
      var all_outputs = {};
      group.cache = {};
      for(var i = 0; i < group.modules.length; i++) {
        var module = create_module(group.modules[i]);
        for(var item in module.input) {
          if (module.input[item] > THR) {
            all_inputs[item] = true;
          }
        }
        for(var item in module.output) {
          if (module.output[item] > THR) {
            all_outputs[item] = true;
          }
        }
      }
      for(var item in all_inputs) {
        if (!(item in all_outputs)) {
          group.storages[item] = 5 * TB_MAX;
          group.cache[item] = 100000;
        }
      }
      for(var item in all_outputs) {
        if (!(item in all_inputs)) {
          group.storages[item] = 5 * TB_MAX;
          group.cache[item] = 100000;
        }
      }
    }
    //emulator.wait(1, { no_wait_message: true, no_cache_log: true });
  };

  // options: no_wait_message, no_cache_log, full_caching
  emulator.wait = function(duration, options) {
    if (!options) { options = {}; };
    if (options.full_caching) {
      prepare_full_caching();
      options.no_wait_message = true;
      options.no_cache_log = true;
    }
    if (!options.no_wait_message) {
      emulator.all_results.push({ type: "wait", duration: duration, start_time: emulator.current_time });
    }
    for(var group_name in emulator.groups) {
      var group = emulator.groups[group_name];
      if (group.modules.length == 0) { continue; }
      for(var item in group.cache) {
        if (group.cache[item] > THR && (group.storages[item] || 0) < THR) {
          group.storages[item] = TB_MAX;
        }
      }
      var calc_data = $.extend({ duration: duration }, group);
      calc_data.modules = $.map(calc_data.modules, create_module);
      var results1 = calc_step(calc_data);
      var t = emulator.current_time;
      for(var i = 0; i < results1.length; i++) {
        results1[i].start_time = t;
        t += results1[i].duration;
        results1[i].end_time = t;
        results1[i].type = "calc_step";
        results1[i].group_name = group_name;
        emulator.all_results.push(results1[i]);
        if (!options.no_cache_log) {
          emulator.all_results.push({
            type: "cache",
            group_name: group_name,
            start_time: t,
            cache: $.extend({}, results1[i].end_cache)
          });
        }
      }
      group.cache = $.extend({}, results1[results1.length - 1].end_cache);
    }
    emulator.current_time += duration;
  };
  emulator.add_message = function(html) {
    emulator.all_results.push({ type: "message", start_time: emulator.current_time, html: html });
  }
  emulator.display = function() {
    display_emulator_results(emulator.all_results, { "was_full_caching": was_full_caching });
  }
  emulator.hand_mine = function(items, group_name) {
    var time = 0;
    for(var item in items) {
      // mining with iron axe
      var speed = {
        "iron-ore": 0.48,
        "copper-ore": 0.48,
        "coal": 0.48,
        "stone": 0.63,
        "raw-wood": 1.8 // by experiment
      }[item];
      if (!speed) {
        throw "unknown item for mining";
      }
      time += Math.ceil(items[item] / speed);
    }
    emulator.all_results.push({ type: "hand_mine", items: $.extend({}, items), duration: time, start_time: emulator.current_time });
    emulator.wait(time, { no_wait_message: true });
    emulator.transfer_items(null, group_name || "player", items, true);
  };
  emulator.hand_craft = function(items, group_from, group_to) {
    if (!group_from) { group_from = "player"; }
    if (!group_to) { group_to = "player"; }
    var inventory = $.extend({}, emulator.groups[group_from].cache);
    var total_time = 0;
    var craft_one = function(item, count) {
      var recipe;
      for(var i = 0; i < factorio_recipes.length; i++) {
        if (factorio_recipes[i].name == item && factorio_recipes[i].category == "crafting") {
          recipe = factorio_recipes[i];
          break;
        }
      }
      if (!recipe) {
        throw "can't craft item: " + format_num(count) + " " + item_icon(item);
      }
      if (recipe.products.length != 1) {
        throw "error: invalid products count for " + item;
      }
      var coef = count / recipe.products[0].amount;
      total_time += recipe.energy * coef;
      for(var i = 0; i < recipe.ingredients.length; i++) {
        var item = recipe.ingredients[i].name;
        var current_count = recipe.ingredients[i].amount * coef;
        var missing_count = current_count - (inventory[item] || 0);
        if (missing_count > THR) {
          inventory[item] = 0;
          craft_one(item, missing_count);
        } else {
          inventory[item] = (inventory[item] || 0) - current_count;
        }
      }
    };
    var result = {
      type: "hand_craft",
      items: $.extend({}, items),
      start_time: emulator.current_time
    };
    try {
      for(var item in items) {
        craft_one(item, items[item]);
      }
      total_time = Math.ceil(total_time);
      result.duration = total_time;
      emulator.all_results.push(result);
      emulator.groups[group_from].cache = inventory;
      emulator.groups[group_from].log_cache();
      emulator.wait(total_time, { no_wait_message: true });
      emulator.transfer_items(null, group_to, items, true);
    } catch(e) {
      result.error = e;
      emulator.all_results.push(result);
    }
  }

  emulator.last_calc_step_result = function() {
    for(var i = emulator.all_results.length - 1; i >= 0; i--) {
      if (emulator.all_results[i].type == "calc_step") {
        return emulator.all_results[i];
      }
    }
  };
  emulator.add_separator = function(html) {
    emulator.all_results.push({ type: "separator", html: html });
  }
  emulator.add_starting_items = function(players_count) {
    emulator.transfer_items(null, "player", {
      "burner-mining-drill": (players_count || 1),
      "stone-furnace": (players_count || 1),
      "iron-plate": 8 * (players_count || 1)
    });
  };

  emulator.add_group("player");

  emulator.add_group("g1");
  emulator.build = emulator.groups.g1.build;
  emulator.create_items = emulator.groups.g1.create_items;
  emulator.destroy_items = emulator.groups.g1.destroy_items;
  return emulator;
}

