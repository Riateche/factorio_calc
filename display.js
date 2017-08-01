/*var item_icon_url_exceptions = {
  "rail": "Straight_rail",
  "logistic-chest-active-provider": "Active_provider_chest",
  "logistic-chest-passive-provider": "Passive_provider_chest",
  "logistic-chest-requester": "Requester_chest",
  "logistic-chest-storage": "Storage_chest",
  "effectivity-module": "Efficiency_module",
  "effectivity-module-2": "Efficiency_module_2",
  "effectivity-module-3": "Efficiency_module_3",
  "shotgun-shell": "Shotgun_shells",
  "piercing-shotgun-shell": "Piercing_shotgun_shells",
  "solar-panel-equipment": "Portable_solar_panel",
  "fusion-reactor-equipment": "Portable_fusion_reactor",
  "energy-shield-equipment": "Energy_shield",
  "energy-shield-mk2-equipment": "Energy_shield_MK2",
  "battery-equipment": "Battery-equipment",
  "battery-mk2-equipment": "Battery_MK2",
  "personal-laser-defense-equipment": "Personal_laser_defense",
  "discharge-defense-equipment": "Discharge_defense",
  "exoskeleton-equipment": "Exoskeleton",
  "personal-roboport-equipment": "Personal_roboport",
  "night-vision-equipment": "Nightvision",
  "personal-roboport-mk2-equipment": "Personal_roboport_MK2",
  "uranium-235": "Uranium-235",
  "uranium-238": "Uranium-238",
};*/
var item_icon_plain_exceptions = {
  "water-energy": 1,
  "research0": 1,
  "research1": 1,
  "research2": 1,
  "research3": 1,
  "research4": 1
};


function item_icon_url(item) {
  /*var name;
  if (item_icon_url_exceptions[item]) {
    name = item_icon_url_exceptions[item];
  } else {
    name = item.charAt(0).toUpperCase() + item.substring(1);
    name = name.split("-").join("_");
  }
  return "https://wiki.factorio.com/images/" + name + ".png";*/
  return "icons/" + item + ".png";
}

function item_icon(item) {
  if (item_icon_plain_exceptions[item] || item.substr(0, 8) == "research") {
    return item;
  }
  return "<img valign='middle' title='" + item + "' alt='" + item + "' src='" + item_icon_url(item) + "'>";
}

var spacer = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

function format_num(num) {
  var x = Math.round(num * 100);
  return (x / 100).toString();
}

function format_time(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  var r = "";
  if (h > 0) { r += h + ":"; }
  r += m > 9 ? m : '0' + m;
  r += ":";
  r += s > 9 ? s : '0' + s;
  return r;
}

function format_percent(num) {
  var x = Math.round(num * 1000);
  return (x / 10).toString() + "%";
}

function format_items(items) {
  var h_items = $("<span/>");
  h_items.addClass("items");
  for(var item in items) {
    if (Math.abs(items[item]) > THR) {
      h_items.append(format_num(items[item]) + " " + item_icon(item) + spacer);
    }
  }
  return h_items;
}

function format_modules_table(modules) {
  var h_modules = $("<table/>").addClass("modules2").addClass("border");
  var header = $("<tr/>");
  header.append($("<th/>").text("Module"));
  header.append($("<th/>").text("Load"));
  header.append($("<th/>").addClass("fails").text("Fails"));
  header.append($("<th/>").text("Input"));
  header.append($("<th/>").text("Output"));
  header.append($("<th/>").addClass("max_input").text("Max input"));
  header.append($("<th/>").addClass("max_output").text("Max output"));
  h_modules.append(header);

  for(var i = 0; i < modules.length; i++) {
    var module = modules[i];
    var h_module = $("<tr/>");
    h_module.append($("<td/>").html(module.name));
    var load_class = "good_load";
    var real_machine_count_text = "";
    if (module.machine_count && module.machine_count > 1) {
      var real_machine_count = Math.ceil(module.machine_count * module.load - THR);
      if (real_machine_count < module.machine_count) {
        load_class = "bad_load";
        if (real_machine_count > 0) {
          real_machine_count_text = " (c = " + real_machine_count + ")";
        }
      }
    }
    if (module.load < THR) {
      load_class = "bad_load";
    }
    h_module.append($("<td/>").addClass(load_class).text(format_percent(module.load) + real_machine_count_text));

    var h_fails = $("<td/>").addClass("fails");
    for(var key in module.fails.input) {
      h_fails.append(format_percent(module.fails.input[key]) + " " + item_icon(key) + " (input)<br>");
    }
    for(var key in module.fails.output) {
      h_fails.append(format_percent(module.fails.output[key]) + " " + item_icon(key) + " (output)<br>");
    }
    h_module.append(h_fails);
    h_module.append($("<td/>").append(format_items(module.input)));
    h_module.append($("<td/>").append(format_items(module.output)));
    h_module.append($("<td/>").addClass("max_input").append(format_items(module.max_input)));
    h_module.append($("<td/>").addClass("max_output").append(format_items(module.max_output)));
    h_modules.append(h_module);
  }
  return h_modules;

}

//options: was_full_caching
function display_emulator_results(data, options) {
  var h_data = $("<table/>").addClass("emulator_results").addClass("border");
  var header = $("<tr/>");
  if (!options.was_full_caching) {
    header.append($("<th/>").text("Start time"));
    header.append($("<th/>").text("Duration"));
  }
  header.append($("<th/>").text("Group"));
  header.append($("<th/>").text("Info"));
  h_data.append(header);
  for(var i = 0; i < data.length; i++) {
    var item = data[i];
    //console.log("item", item);
    var h_item = $("<tr/>");
    h_item.addClass("item_" + item.type);
    if (item.type == "separator") {
      if (!item.html) {
        h_item.addClass("empty_separator");
      }
      h_item.append($("<td/>").attr("colspan", 4).html(item.html || ""));
    } else {
      if (!options.was_full_caching) {
        h_item.append($("<td/>").text(format_time(item.start_time)));
        h_item.append($("<td/>").text(item.duration ? format_time(item.duration) : "-"));
      }
      var h_group = $("<td/>");
      if (item.group_name) {
        h_group.text(item.group_name);
      } else if (item.group_from && !item.group_to) {
        h_group.text(item.group_from);
      } else if (item.group_to && !item.group_from) {
        h_group.text(item.group_to);
      } else if (item.group_to && item.group_from) {
        h_group.text(item.group_from + " ⟶ " + item.group_to);
      } else {
        h_group.text("-");
      }
      h_item.append(h_group);
      var h_info = $("<td/>");
      if (item.type == "message") {
        h_info.html(item.html);
      } else if (item.type == "transfer_items") {
        var t = "";
        if (item.group_from && item.group_to) {
          h_info.append("Move items: ");
        } else if (item.group_from) {
          h_info.append("Remove items: ");
        } else if (item.group_to) {
          h_info.append("Add items: ");
        }
        h_info.append(format_items(item.items));
      } else if (item.type == "cache") {
        h_info.append("Items: ");
        h_info.append(format_items(item.cache));
      } else if (item.type == "wait") {
        h_info.append("Wait");
      } else if (item.type == "hand_mine") {
        h_info.append("Hand mine: ");
        h_info.append(format_items(item.items));
      } else if (item.type == "hand_craft") {
        h_info.append("Hand craft: ");
        h_info.append(format_items(item.items));
      } else if (item.type == "build") {
        h_info.append("Build ");
        h_info.append(item.modules.join("; "));
      } else if (item.type == "calc_step") {
        h_info.append("Cache change / sec: ");
        h_info.append(format_items(item.cache_speed));
        h_info.append(spacer);
        h_info.append("Energy: " + format_num(item.energy) + " MW<br>");
        h_info.append(format_modules_table(item.modules));
      }
      if (item.error) {
        h_info.append("<br>Error: " + item.error);
        h_item.addClass("error_item");
      }
      h_item.append(h_info);
    }
    h_data.append(h_item);
  }

  $("#dbg").append(h_data);
}

function update_program_list() {
  $("#program_list").empty();
  if (!storage.programs) {
    storage.programs = [];
  }
  $.each(storage.programs, function(i, program) {
    $("#program_list").append($("<option/>").attr("value", i).text(program.title));
  });






}


