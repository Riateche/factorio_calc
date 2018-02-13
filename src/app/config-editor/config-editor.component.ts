import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../config.service';
import { Config } from '../config';
import { RouteService } from '../route.service';

@Component({
  selector: 'app-config-editor',
  templateUrl: './config-editor.component.html',
  styleUrls: ['./config-editor.component.css']
})
export class ConfigEditorComponent implements OnInit {
  originalConfigName: string
  config: Config

  constructor(private route: ActivatedRoute, private configService: ConfigService, private router: Router, private routes: RouteService) { }

  ngOnInit() {
    console.log(this.route.snapshot.paramMap);
    this.originalConfigName = this.route.snapshot.paramMap.get("name");
    var config = this.configService.configByName(this.originalConfigName);
    if (!config) {
      alert(`Config not found: ${this.originalConfigName}`)
      this.router.navigate([this.routes.configs()]);
      return;
    }
    this.config = config.clone();
  }

  deleteConfig() {
    if (!confirm("Delete this config?")) {
      return;
    }
    this.configService.deleteConfig(this.originalConfigName);
    this.router.navigate([this.routes.configs()]);
  }

  save() {
    console.log('test1', this.config);
    this.configService.updateConfig(this.originalConfigName, this.config);
    this.router.navigate([this.routes.configs()]);
  }
}
