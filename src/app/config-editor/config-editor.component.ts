import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../config.service';
import { Config } from '../config';

@Component({
  selector: 'app-config-editor',
  templateUrl: './config-editor.component.html',
  styleUrls: ['./config-editor.component.css']
})
export class ConfigEditorComponent implements OnInit {
  originalConfigName: string
  config: Config

  constructor(private route: ActivatedRoute, private configService: ConfigService, private router: Router) { }

  ngOnInit() {
    console.log(this.route.snapshot.paramMap);
    this.originalConfigName = this.route.snapshot.paramMap.get("name");
    var config = this.configService.configByName(this.originalConfigName);
    if (!config) {
      alert(`Config not found: ${name}`)
      this.router.navigate(['']);
      return;
    }
    this.config = config.clone();
  }

  deleteConfig() {
    if (!confirm("Delete this config?")) {
      return;
    }
    this.configService.deleteConfig(this.originalConfigName);
    this.router.navigate(['']);
  }
}
