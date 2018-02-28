import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigsComponent } from './configs.component';
import { ConfigService } from '../config.service';
import { RouteService } from '../route.service';
import { Config } from '../config';

describe('ConfigsComponent', () => {
  let component: ConfigsComponent;
  let fixture: ComponentFixture<ConfigsComponent>;
  let nativeElement: any;
  let configServiceStub = {
    allConfigs: () => {
      let configs = [];
      let c = new Config("name1");
      c.title = "Title 1";
      configs.push(c);
      c = new Config("name2");
      configs.push(c);
      c = new Config("name3");
      c.title = "Title 3";
      configs.push(c);
      return configs;
    }
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigsComponent ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        {provide: ConfigService, useValue: configServiceStub },
        RouteService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    nativeElement = fixture.debugElement.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it(`should load existing configs`, async(() => {
    expect(component.configs.length).toEqual(3);
    expect(component.configs[0].name).toEqual("name1");
    expect(component.configs[2].name).toEqual("name3");
  }));
  it(`should render existing configs`, async(() => {
    expect(nativeElement.querySelector("a[href=\"/config/name1\"]")).toBeTruthy();
    expect(nativeElement.querySelector("a[href=\"/config/name4\"]")).toBeFalsy();

    expect(nativeElement.querySelector("a[href=\"/config/name1\"]").textContent).toContain("Title 1");
    expect(nativeElement.querySelector("a[href=\"/config/name2\"]").textContent).toContain("name2");
    expect(nativeElement.querySelector("a[href=\"/config/name3\"]").textContent).toContain("Title 3");
  }));


  // it('should render title in a h1 tag', async(() => {
  //   expect(compiled.querySelector('h1').textContent).toContain('Welcome to app!');
  // }));











});
