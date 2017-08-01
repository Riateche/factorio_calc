
var MAX_STEPS = 50;
var total_steps = 0;


// item, cache_speed, cache_count, max_count1, max_count2
function item_buffer(config) {
  var r = $.extend({ count1: 0, count2: 0 }, config);
  r.put = function(count, try_mode) {
    var new_count = r.count1 + count;
    if (new_count > r.max_count1 + THR) {
      return false;
    }
    if (!try_mode) {
      r.count1 = new_count;
    }
    return true;
  };
  r.take = function(count, try_mode) {
    //if (r.item == "iron-plate") { console.log("take", $.extend(r, {}), count, try_mode); }
    var new_count = r.count2 - count;
    if (new_count < -THR) {
      //if (r.item == "iron-plate") { console.log("take failed"); }
      return false;
    }
    //if (r.item == "iron-plate") { console.log("take succeded"); }
    if (!try_mode) {
      r.count2 = new_count;
    }
    return true;
  };
  r.tick = function() {
    var free_space2 = r.max_count2 - r.count2;
    if (r.cache_speed > THR) {
      //if (r.item == "iron-plate") { console.log("before tick", $.extend(r, {})); }
      var transfer_count1 = min(r.count1, r.cache_speed);
      r.count1 -= transfer_count1;
      r.cache_count += transfer_count1;
      var transfer_count2 = min(free_space2, r.cache_speed, r.cache_count);
      r.count2 += transfer_count2;
      r.cache_count -= transfer_count2;
      //if (r.item == "iron-plate") { console.log("after tick", $.extend(r, {}), transfer_count1, transfer_count2); }
    } else {
      var transfer_count = min(free_space2, r.count1);
      r.count1 -= transfer_count;
      r.count2 += transfer_count;
    }
  };
  return r;
}

function calc_step(data) {
  total_steps++;
  //console.log(total_steps);
  if (total_steps > MAX_STEPS) {
    throw "MAX_STEPS reached";
  }
  data.storages = data.storages || {};

  var modules = $.map(data.modules, function(m) {
    return $.extend(true, { cycles: 0, fails: { input: {}, output: {} } }, m );
  });

  var all_items = {};
  for(var item in data.storages) {
    all_items[item] = true;
  }
  for(var i = 0; i < modules.length; i++) {
    for(var item in modules[i].input || {}) {
      all_items[item] = true;
    }
    for(var item in modules[i].output || {}) {
      all_items[item] = true;
    }
  }

  var dt = 0.01;
  var total_cycles = 10000;
  var starting_cycle = total_cycles / 5;

  var buffers = {};
  for(var item in all_items) {
    var c = {};
    c.item = item;
    c.cache_speed = (data.storages[item] || 0) * dt;
    if ((data.cache[item] || 0) > THR) {
      c.cache_count = c.cache_speed * (total_cycles + 5);
    } else {
      c.cache_count = 0;
    }
    c.max_count1 = 0;
    c.max_count2 = 0;
    for(var i = 0; i < modules.length; i++) {
      //console.log("module", $.extend(modules[i], {}));
      if (((modules[i].input || [])[item] || 0) > THR) {
        var v = modules[i].input[item] * dt;
        //console.log("item", item, "v", v);
        c.max_count2 += v;
      }
      if (((modules[i].output || [])[item] || 0) > THR) {
        var v = modules[i].output[item] * dt;
        //console.log("item", item, "v", v);
        c.max_count1 += v;
      }
    }
    c.max_count1 *= 5;
    c.max_count2 *= 5;
    buffers[item] = item_buffer(c);
  }



  for(var cycle_i = 0; cycle_i < total_cycles; cycle_i++) {
    //console.log("buffers", $.map(buffers, function(x) { return $.extend(x, {}); }));
    for(var item in buffers) {
      buffers[item].tick();
    }

    for(var i = 0; i < modules.length; i++) {
      if (cycle_i == starting_cycle) {
        modules[i].cycles = 0;
        modules[i].fails = { input: {}, output: {} }
      }
      //console.log("trying to run", i);
      var has_inputs = true;
      for(var item in modules[i].input || []) {
        if (!buffers[item].take(modules[i].input[item] * dt, true)) {
          has_inputs = false;
          modules[i].fails.input[item] = (modules[i].fails.input[item] || 0) + 1;
          //console.log("missing input", item);
          break;
        }
      }
      if (!has_inputs) { continue; }
      var can_output = true;
      for(var item in modules[i].output || []) {
        if (!buffers[item].put(modules[i].output[item] * dt, true)) {
          can_output = false;
          modules[i].fails.output[item] = (modules[i].fails.output[item] || 0) + 1;
          //console.log("missing output", item);
          break;
        }
      }
      if (!can_output) { continue; }
      //console.log("running");
      for(var item in modules[i].input || []) {
        buffers[item].take(modules[i].input[item] * dt);
      }
      for(var item in modules[i].output || []) {
        buffers[item].put(modules[i].output[item] * dt);
      }
      modules[i].cycles++;
    }
    //console.log("item_counts 3", item_counts);
  }
  for(var i = 0; i < modules.length; i++) {
    modules[i].load = modules[i].cycles / (total_cycles - starting_cycle);
    for(var item in modules[i].fails.input) {
      modules[i].fails.input[item] /= (total_cycles - starting_cycle);
    }
    for(var item in modules[i].fails.output) {
      modules[i].fails.output[item] /= (total_cycles - starting_cycle);
    }
    modules[i].max_input = modules[i].input || {};
    modules[i].max_output = modules[i].output || {};
    modules[i].input = {};
    for(var item in modules[i].max_input) {
      modules[i].input[item] = modules[i].load * modules[i].max_input[item];
    }
    modules[i].output = {};
    for(var item in modules[i].max_output) {
      modules[i].output[item] = modules[i].load * modules[i].max_output[item];
    }


  }
  var cache_speed = {};
  for(var i = 0; i < modules.length; i++) {
    for(var item in modules[i].input || []) {
      cache_speed[item] = (cache_speed[item] || 0) - modules[i].input[item];
    }
    for(var item in modules[i].output || []) {
      cache_speed[item] = (cache_speed[item] || 0) + modules[i].output[item];
    }
  }
  for(var item in cache_speed) {
    if (Math.abs(cache_speed[item]) < THR) {
      cache_speed[item] = 0;
    }
    if (!data.storages[item] && Math.abs(cache_speed[item]) < 0.1) {
      cache_speed[item] = 0;
    }
  }

  var duration = data.duration;
  for (item in cache_speed) {
    if (cache_speed[item] < -THR) {
      //if ((cache[item] || 0) < THR) {
      //  throw "negative cache speed for item not in cache: " + item + " (" + cache_speed[item] + ")";
      //}
      var some_max_duration = (data.cache[item] || 0) / (-cache_speed[item]);
      if (some_max_duration < THR) {
        //throw "invalid max duration for item " + item + " (speed: " + cache_speed[item] + ")";
        console.log("invalid max duration for item " + item + " (speed: " + cache_speed[item] + ")");
        continue;
      }
      duration = min(duration, some_max_duration);
    }
  }
  var new_cache = $.extend({}, data.cache);
  for (item in cache_speed) {
    new_cache[item] = (new_cache[item] || 0) + cache_speed[item] * duration;
  }
  var energy = 0;
  for(var i = 0; i < modules.length; i++) {
    var c = modules[i].energy_consumption || 0;
    if (c < -THR) {
      energy += c * modules[i].load;
    } else {
      energy += c;
    }
  }
  var output = {
    modules: modules,
    storages: data.storages,
    start_cache: data.cache,
    cache_speed: cache_speed,
    end_cache: new_cache,
    duration: Math.round(duration),
    energy: energy
  };
  if (duration == data.duration) {
    return [output];
  } else {
    var new_data = $.extend({}, data);
    new_data.duration = data.duration - duration;
    new_data.cache = new_cache;
    var r = calc_step(new_data);
    r.unshift(output); // add to beginning
    return r;
  }
}


