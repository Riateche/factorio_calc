

function load_storage() {
  if (!localStorage || !JSON) {
    alert("Your browser is not supported.");
    return;
  }
  window.storage = JSON.parse(localStorage.getItem("factorio_calc_storage1") || "{}");
  if (!window.storage.options) {
    window.storage.options = {};
  }
}


function save_storage() {
  localStorage.setItem("factorio_calc_storage1", JSON.stringify(window.storage));
}
