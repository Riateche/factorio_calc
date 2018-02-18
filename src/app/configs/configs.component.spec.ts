import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigsComponent } from './configs.component';
import { ConfigService } from '../config.service';
import { RouteService } from '../route.service';

describe('ConfigsComponent', () => {
  let component: ConfigsComponent;
  let fixture: ComponentFixture<ConfigsComponent>;
  let configServiceStub = {
    allConfigs: () => []
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
