1. Input in game console:

/c
local r = {}
for k, recipe in pairs(game.player.force.recipes) do
  local recipe2 = {}
  for _, prop in pairs({"name", "ingredients", "products", "energy", "category"}) do
    recipe2[prop] = recipe[prop]
  end
  table.insert(r, recipe2)
end
game.write_file("recipes-0.16.lua", serpent.dump(r) .. "\n", true)

2. Find the file in %appdata%\Factorio\script-output
3. Run the following command to produce JSON.

lua53 convert.lua recipes-0.16.lua > recipes-0.16.json
