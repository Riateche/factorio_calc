import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Machine } from '../machine';
import { DropdownOption } from '../dropdown/dropdown.component';
import { GameData } from '../game-data';
import { DropdownListsService } from '../dropdown-lists.service';
import { ConfigService } from '../config.service';
@Component({
  selector: 'machine-editor',
  templateUrl: './machine-editor.component.html',
  styleUrls: ['./machine-editor.component.css']
})
export class MachineEditorComponent implements OnInit {
  private _machine: Machine;
  gameData: GameData;

  get machine() : Machine {
    return this._machine;
  }
  @Input() set machine(m: Machine) {
    this._machine = m;
    this.machine.globalSettings = this.configService.settings();
    this.machine.updateProperties();
  }
  @Output() onDeleteRequested = new EventEmitter<void>();

  constructor(private dropdownLists: DropdownListsService, private configService: ConfigService) {
    this.gameData = GameData.current();
  }

  ngOnInit() {
  }



  hasAnyKey(value: any) {
    for(let x in value) {
      return true;
    }
    return false;

  }

  setRecommendedCount() {
    this.machine.count = this.machine.emulatorResult.recommendedCount;
  }

  allReplaceOptions() {
    let r = [];
    let recipes = this.gameData.recipes.filter(r =>
      r.products.find(p => p.name == this.machine.recipe) != null);
    for(let recipe of recipes) {
      r.push(new DropdownOption({
        value: recipe.name,
        text: `craft for ${recipe.name}`,
        icon: GameData.itemIconPath(recipe.name)
      }));
    }
    if (this.gameData.recipesPerMachineType["electric-mining-drill"].indexOf(this.machine.recipe) !== -1) {
      r.push(new DropdownOption({
        value: "electric-mining-drill",
        text: `electric-mining-drill for ${this.machine.recipe}`,
        icon: GameData.itemIconPath(this.machine.recipe)
      }));
    }
    r.push(new DropdownOption({
      value: "matter-source",
      text: `matter-source for ${this.machine.recipe}`,
      icon: GameData.itemIconPath(this.machine.recipe)
    }));
    return r;
  }

  doReplace(value: string) {
    this.machine.isAutoAdded = false;
    if (value == "matter-source") {
      this.machine.type = "matter-source";
    } else if (value == "electric-mining-drill" &&
               this.gameData.recipesPerMachineType["electric-mining-drill"].indexOf(this.machine.recipe) !== -1) {
      this.machine.type = "electric-mining-drill";
    } else {
      this.gameData.setRecipe(value, this.machine, this.configService.settings());
    }
    if (this.machine.hasFuel() && this.machine.fuel === "") {
      this.machine.fuel = this.configService.settings().defaultFuel;
    }
  }


  isCreative() {
    return this.machine.type == "matter-source" || this.machine.type == "matter-sink";
  }

}
