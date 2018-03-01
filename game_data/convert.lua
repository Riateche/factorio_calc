if not arg[1] then
  error("Usage: lua5.3 convert.lua recipes_input.lua > recipes_output.json")
end
local JSON = (loadfile "json.lua")()
local v = loadfile(arg[1])()
print(JSON:encode_pretty(v))
