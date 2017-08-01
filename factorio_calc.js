

var THR = 0.001;
var min = Math.min;
var max = Math.max;



function assert_int(num) {
  if (Math.abs(num % 1) > THR) {
    throw new Error("expected integer, got " + num);
  }
}


//----------------------------





function item_ui_category(item) {
  if (item.match(/(inserter|belt|splitter)$/)) {
    return "Transporting";
  }
  if (item.match(/iron-stick|gear|circuit|processing|^battery|engine-unit$|low-density-structure|rocket-part|rocket-control-unit|copper-cable|satellite/)) {
    return "Components";
  }
  if (item.match(/armor|equipment|discharge-defense/)) {
    return "Armor";
  }
  if (item.match(/shotgun|shell|pistol|rounds|magazine|gun|rocket|grenade|capsule|flamethrower|^explosives$|bomb|turret|land-mine/)) {
    return "Weapons";
  }
  if (item.match(/science-pack/)) {
    return "Science packs";
  }
  if (item.match(/^(water|petroleum-gas|lubricant|steam|sulfuric-acid)(-barrel){0,1}$|oil(-barrel){0,1}$/)) {
    return "Liquids and gases";
  }
  if (item.match(/drill|furnace|assembling-machine|rocket-silo|chemical-plant|oil-refinery|pumpjack|centrifuge/)) {
    return "Producers";
  }
  if (item.match(/-module(|-2|-3)$/)) {
    return "Modules";
  }
  //if (item.match(/repair-pack|wire|axe/)) {
  //  return "Tools";
  //}
  if (item.match(/wood$|-ore$|-plate$|coal|^stone$|stone-brick|solid-fuel|plastic-bar|^uranium-23(5|8)$|fuel-cell$|^sulfur$/)) {
    return "Resources";
  }
  if (item.match(/wire|combinator|power-switch/)) {
    return "Circuit network";
  }
  if (item.match(/robot|roboport|logistic-chest/)) {
    return "Robotics";
  }
  if (item.match(/electric-pole|substation|accumulator|solar-panel|steam-engine/)) {
    return "Enectricity";
  }
  return "Other";
}

function build_item_list() {
  var blacklist = [
    "loader",
    "fast-loader",
    "express-loader",
    "small-lamp",
    "electric-energy-interface",
    "railgun",
    "railgun-dart",
    "small-plane",
    "player-port"
  ];
  var r = [];
  function add_name(name) {
    if (blacklist.indexOf(name) >= 0) { return; }
    if (r.indexOf(name) < 0) {
      r.push(name);
    }
  }

  $.each(factorio_recipes, function(i, recipe) {
    $.each(recipe.ingredients || [], function(i, s) {
      add_name(s.name);
    });
    $.each(recipe.products || [], function(i, s) {
      add_name(s.name);
    });
  });
  delete r["loader"];
  delete r["fast-loader"];
  delete r["express-loader"];
  delete r["small-lamp"];
  delete r["electric-energy-interface"];
  delete r["railgun"];
  delete r["railgun-dart"];
  delete r["small-plane"];
  delete r["player-port"];
  var categorized = {};
  $.each(r, function(i, name) {
    var cat = item_ui_category(name);
    if (!categorized[cat]) { categorized[cat] = []; }
    categorized[cat].push(name);
  });
  categorized["Processing"] = [];
  $.each(factorio_recipes, function(i, recipe) {
    if (blacklist.indexOf(recipe.name) >= 0) { return; }
    if (recipe.name.match(/^(fill|empty)-[\w\-]+-barrel$/)) { return; }
    if (r.indexOf(recipe.name) < 0) {
      categorized["Processing"].push(recipe.name);

    }
  });

  var html = "";
  for (cat in categorized) {
    html += "<tr><td>" + cat + "</td><td>";
    $.each(categorized[cat], function(i, name) {
      html += item_icon(name);
    });
    html += "</td></tr>";
  }
  $("#items_list").html("<table>" + html + "</table>");

}


function execute_program(text, final_wait) {
  $("#dbg").html("");
  var final_text = "var e = emulator();\n" + text + "\n";
  if (final_wait == "full_caching") {
    final_text += "e.wait(1, { full_caching: true });\n";
  } else if (final_wait == "hour") {
    final_text += "e.wait(3600);\n";
  }
  final_text += "e.display();";
  try {
    eval(final_text);
  } catch (e) {
    alert("Error: " + e);
  }

  /*
  group.create_items
  group.destroy_items
  group.build(module, true)
  group.build(crafter(..), true)

  emulator.wait

  */
}

function current_program_index() {
  var index = parseInt($("#program_list").val()[0]);
  if (!storage.programs[index]) {
    return -1;
  }
  return index;
}

$.fn.setSelectionRange = function(selectionStart, selectionEnd) {
  if (this.length == 0) return;
  var input = this[0];
  input.focus();
  if (input.setSelectionRange) {
    input.setSelectionRange(selectionStart, selectionEnd);
  }
  else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}
$.fn.setCaretPos = function(pos) {
  this.setSelectionRange(pos, pos);
};
$.fn.getCaretPos = function() {
  if (this.length == 0) return;
  var ctrl = this[0];
  var pos = 0;
  if (document.selection) {
    // IE Support
    ctrl.focus();
    var sel = document.selection.createRange();
    sel.moveStart('character', -ctrl.value.length);
    pos = sel.text.length;
  } else if (ctrl.selectionStart || ctrl.selectionStart == '0') {
    // Firefox support
    pos = ctrl.selectionStart;
  }
  return pos;
}
$.fn.insertAtCaret = function(text) {
  var pos = this.getCaretPos();
  var value = this.val();
  this.val(value.substr(0, pos) + text + value.substr(pos));
}

function options_changed() {
  $("#dbg").toggleClass("show_max_input", $("#show_max_input").is(":checked"));
  $("#dbg").toggleClass("show_fails", $("#show_fails").is(":checked"));
  $("#dbg").toggleClass("show_energy", $("#show_energy").is(":checked"));
  $("#dbg").toggleClass("show_cache_modules", $("#show_cache_modules").is(":checked"));

  window.storage.options.show_max_input = $("#show_max_input").is(":checked");
  window.storage.options.show_fails = $("#show_fails").is(":checked");
  window.storage.options.show_energy = $("#show_energy").is(":checked");
  window.storage.options.show_cache_modules = $("#show_cache_modules").is(":checked");
  save_storage();
}

$(function() {
  build_item_list();
  load_storage();

  $("#show_max_input").prop("checked", window.storage.options.show_max_input);
  $("#show_fails").prop("checked", window.storage.options.show_fails);
  $("#show_energy").prop("checked", window.storage.options.show_energy);
  $("#show_cache_modules").prop("checked", window.storage.options.show_cache_modules);
  $("#options input").on("change", options_changed);
  options_changed();

  update_program_list();

  $("#create_program").on("click", function() {
    if (!storage.programs) {
      storage.programs = [];
    }
    var i = storage.programs.length + 1;
    var default_text = "";


    storage.programs.push({ title: "Program " + i, text: default_text, final_wait: "full_caching" });
    update_program_list();
    $("#program_list").val([storage.programs.length - 1]);
    $("#program_list").change();
    save_storage();
    $("#program_text").setCaretPos(default_text.indexOf("\ne.wait("));
  });

  $("#program_list").on("change", function() {
    if ($("#program_list").val().length > 1) {
      $("#program_list").val([$("#program_list").val()[0]]);

    }
    var index = current_program_index();
    $("#program_text").val(index >= 0 ? storage.programs[index].text : "");
    $("#program_final_wait_full_caching").prop("checked",
        storage.programs[index].final_wait == "full_caching");
    $("#program_final_wait_hour").prop("checked",
        storage.programs[index].final_wait == "hour");
    $("#program_final_wait_none").prop("checked",
        storage.programs[index].final_wait == "none");
  });

  $("#execute_program").on("click", function() {
    var index = current_program_index();
    if (index < 0) {
      alert("No program selected.");
      return;
    }
    var text = $("#program_text").val();
    storage.programs[index].text = text;
    if ($("#program_final_wait_full_caching").is(":checked")) {
      storage.programs[index].final_wait = "full_caching";
    }
    if ($("#program_final_wait_hour").is(":checked")) {
      storage.programs[index].final_wait = "hour";
    }
    if ($("#program_final_wait_none").is(":checked")) {
      storage.programs[index].final_wait = "none";
    }
    save_storage();
    execute_program(text, storage.programs[index].final_wait);
  });

  $("#delete_program").on("click", function() {
    var index = current_program_index();
    if (index < 0) {
      alert("No program selected.");
      return;
    }
    if (!confirm("Delete this program?")) { return; }
    storage.programs.splice(index, 1);
    $("#program_text").val("");
    save_storage();
    update_program_list();
  });

  $("#rename_program").on("click", function() {
    var index = current_program_index();
    if (index < 0) {
      alert("No program selected.");
      return;
    }
    var r = prompt("Input program name", storage.programs[index].title);
    if (!r) { return; }
    storage.programs[index].title = r;
    save_storage();
    update_program_list();
  });

  var items_list_destination = null;
  var items_list_hide_timer = null;
  $(document).on("focus", ".input_item", function() {
    var pos = $(this).offset();
    pos.top += $(this).outerHeight();
    if (items_list_hide_timer) {
      clearTimeout(items_list_hide_timer);
      items_list_hide_timer = null;
    }
    $("#items_list").css(pos).show();
    $(this).change();
    items_list_destination = $(this);
  });
  $(document).on("change keyup", ".input_item", function() {
    if ($(this).is(":focus")) {
      var value = $(this).val();
      $("#items_list img").each(function() {
        $(this).toggle($(this).attr("title").indexOf(value) >= 0);
      });
    }
  });
  $(document).on("focusout", ".input_item", function() {
    items_list_hide_timer = setTimeout(function() {
      $("#items_list").hide();
      items_list_hide_timer = null;
    }, 100);
  });

  $(document).on("click", "#items_list img", function() {
    console.log("click1");
    if (items_list_destination) {
      items_list_destination.val($(this).attr("title"));
    }
  });



  $("#add_module").on("submit", function() {
    if (current_program_index() < 0) {
      alert("No program selected.");
      return;
    }

    var config = {};
    config.type = $("#add_module_type").val();
    if (config.type == "") {
      alert("Invalid type");
      return;
    }
    config.item = $("#add_module_item").val();

    var count = parseInt($("#add_module_count").val());
    if (!(count >= 1)) {
      alert("Invalid count");
      return;
    }
    if (count != 1) {
      config.count = count;
    }
    var D = 0.00001;

    var speed = parseFloat($("#add_module_speed").val());
    if (!(speed >= 0)) {
      alert("Invalid speed");
      return;
    }
    if (Math.abs(speed - 1) > D) {
      config.speed = speed;
    }

    var productivity = parseFloat($("#add_module_productivity").val());
    if (!(productivity >= 0)) {
      alert("Invalid productivity");
      return;
    }
    if (Math.abs(productivity - 1) > D) {
      config.productivity = productivity;
    }

    var energy_consumption = parseFloat($("#add_module_energy_consumption").val());
    if (!(energy_consumption >= 0)) {
      alert("Invalid energy consumption");
      return;
    }
    if (Math.abs(energy_consumption - 1) > D) {
      config.energy_consumption = energy_consumption;
    }
    try {
      create_module($.extend({}, config));
    } catch (e) {
      alert(e);
      return;
    }
    var text = "e.build(" + JSON.stringify(config) + ");\n";
    $("#program_text").insertAtCaret(text);

  });

  $("#add_module_clear").on("click", function() {
    $("#add_module_type").val("crafter");
    $("#add_module_item").val("");
    $("#add_module_count").val(1);
    $("#add_module_speed").val(1);
    $("#add_module_productivity").val(1);
    $("#add_module_energy_consumption").val(1);
  });

  $("#hints").append(item_icon("transport-belt") + " = 13.3 / s<br>");
  $("#hints").append(item_icon("fast-transport-belt") + " = 26.6 / s<br>");
  $("#hints").append(item_icon("express-transport-belt") + " = 40 / s<br>");

  $("#hints").append(item_icon("inserter") + " = 0.86 / s<br>");
  $("#hints").append(item_icon("long-handed-inserter") + " = 1.14 / s<br>");
  $("#hints").append(item_icon("fast-inserter") + " = 2.3 / s<br>");

});
