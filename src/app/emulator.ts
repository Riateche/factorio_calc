import { Machine } from "./machine"

const THR = 0.001;
let min = Math.min;
let max = Math.max;

interface ItemBufferConfig {
  item: string;
  max_count1: number;
  max_count2: number;
}

export interface EmulatorResult {
  load: number;
  inputFails: {[key: string]: number};
  outputFails: {[key: string]: number};
  input: {[key: string]: number};
  output: {[key: string]: number};
}


class ItemBuffer {
  private config: ItemBufferConfig;
  private count1: number = 0;
  private count2: number = 0;

  constructor(config: ItemBufferConfig) {
    this.config = config;
  }

  put(count: number, try_mode?: boolean) : boolean {
    let new_count = this.count1 + count;
    if (new_count > this.config.max_count1 + THR) {
      return false;
    }
    if (!try_mode) {
      this.count1 = new_count;
    }
    return true;
  }

  take(count: number, try_mode?: boolean) : boolean {
    let new_count = this.count2 - count;
    if (new_count < -THR) {
      return false;
    }
    if (!try_mode) {
      this.count2 = new_count;
    }
    return true;
  };

  tick() {
    let free_space2 = this.config.max_count2 - this.count2;

    let transfer_count = min(free_space2, this.count1);
    this.count1 -= transfer_count;
    this.count2 += transfer_count;
  }

}

class Module {
  machine: Machine;
  cycles: number = 0;
  inputFails: any = {};
  outputFails: any = {};

  constructor(m: Machine) {
    this.machine = m;
  }

}



export function runEmulator(machines: Array<Machine>) : {[key: string]: number} {

  let modules = machines.map(m => new Module(m));

  let all_items = {};
  for(let i = 0; i < modules.length; i++) {
    for(let item in modules[i].machine.maxInput || {}) {
      all_items[item] = true;
    }
    for(let item in modules[i].machine.maxOutput || {}) {
      all_items[item] = true;
    }
  }

  let dt = 0.01;
  let total_cycles = 10000;
  let starting_cycle = total_cycles / 5;

  let buffers: {[key: string]: ItemBuffer} = {};

  for(let item in all_items) {
    let max_count1 = 0;
    let max_count2 = 0;
    for(let i = 0; i < modules.length; i++) {
      //console.log("module", $.extend(modules[i], {}));
      if (((modules[i].machine.maxInput || [])[item] || 0) > THR) {
        let v = modules[i].machine.maxInput[item] * dt;
        //console.log("item", item, "v", v);
        max_count2 += v;
      }
      if (((modules[i].machine.maxOutput || [])[item] || 0) > THR) {
        let v = modules[i].machine.maxOutput[item] * dt;
        //console.log("item", item, "v", v);
        max_count1 += v;
      }
    }
    max_count1 *= 5;
    max_count2 *= 5;
    buffers[item] = new ItemBuffer({
      item: item,
      max_count1: max_count1,
      max_count2: max_count2
    });
  }



  for(let cycle_i = 0; cycle_i < total_cycles; cycle_i++) {
    //console.log("buffers", $.map(buffers, function(x) { return $.extend(x, {}); }));
    for(let item in buffers) {
      buffers[item].tick();
    }

    for(let i = 0; i < modules.length; i++) {
      if (cycle_i == starting_cycle) {
        modules[i].cycles = 0;
        modules[i].inputFails = {};
        modules[i].outputFails = {};
      }
      //console.log("trying to run", i);
      let has_inputs = true;
      for(let item in modules[i].machine.maxInput || []) {
        if (!buffers[item].take(modules[i].machine.maxInput[item] * dt, true)) {
          has_inputs = false;
          modules[i].inputFails[item] = (modules[i].inputFails[item] || 0) + 1;
          //console.log("missing input", item);
          break;
        }
      }
      if (!has_inputs) { continue; }
      let can_output = true;
      for(let item in modules[i].machine.maxOutput || []) {
        if (!buffers[item].put(modules[i].machine.maxOutput[item] * dt, true)) {
          can_output = false;
          modules[i].outputFails[item] = (modules[i].outputFails[item] || 0) + 1;
          //console.log("missing output", item);
          break;
        }
      }
      if (!can_output) { continue; }
      //console.log("running");
      for(let item in modules[i].machine.maxInput || []) {
        buffers[item].take(modules[i].machine.maxInput[item] * dt);
      }
      for(let item in modules[i].machine.maxOutput || []) {
        buffers[item].put(modules[i].machine.maxOutput[item] * dt);
      }
      modules[i].cycles++;
    }
    //console.log("item_counts 3", item_counts);
  }
  for(let i = 0; i < modules.length; i++) {
    let result = {
      load: modules[i].cycles / (total_cycles - starting_cycle),
      inputFails: {},
      outputFails: {},
      input: {},
      output: {}
    };
    for(let item in modules[i].inputFails) {
      result.inputFails[item] = modules[i].inputFails[item] /
        (total_cycles - starting_cycle);
    }
    for(let item in modules[i].outputFails) {
      result.outputFails[item] = modules[i].outputFails[item] /
        (total_cycles - starting_cycle);
    }
    for(let item in modules[i].machine.maxInput) {
      result.input[item] = result.load * modules[i].machine.maxInput[item];
    }
    for(let item in modules[i].machine.maxOutput) {
      result.output[item] = result.load * modules[i].machine.maxOutput[item];
    }
    modules[i].machine.emulatorResult = result;
  }
  let cache_speed = {};
  for(let i = 0; i < modules.length; i++) {
    for(let item in modules[i].machine.emulatorResult.input || []) {
      cache_speed[item] = (cache_speed[item] || 0) - modules[i].machine.maxInput[item];
    }
    for(let item in modules[i].machine.maxOutput || []) {
      cache_speed[item] = (cache_speed[item] || 0) + modules[i].machine.maxOutput[item];
    }
  }
  for(let item in cache_speed) {
    if (Math.abs(cache_speed[item]) < 0.1) {
      cache_speed[item] = 0;
    }
  }
  return cache_speed;
}

