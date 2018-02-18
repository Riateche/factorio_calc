import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigEditorComponent } from './config-editor.component';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../config.service';
import { RouteService } from '../route.service';
import { Config } from '../config';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

describe('ConfigEditorComponent', () => {
  let component: ConfigEditorComponent;
  let fixture: ComponentFixture<ConfigEditorComponent>;
  let configServiceStub = {
    configByName: (name) => {
      expect(name).toBe("name1");
      let config = new Config("name1");
      config.title = "Title 1";
      return config;
    }
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigEditorComponent ],
      imports: [
        RouterTestingModule,
        FormsModule
      ],
      providers: [
        {provide: ConfigService, useValue: configServiceStub },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (paramName) => {
                  expect(paramName).toBe("name");
                  return "name1";
                }
              }
            }
          }
        },
        RouteService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
