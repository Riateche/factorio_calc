import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsSpeedComponent } from './items-speed.component';

describe('ItemsSpeedComponent', () => {
  let component: ItemsSpeedComponent;
  let fixture: ComponentFixture<ItemsSpeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemsSpeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsSpeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
