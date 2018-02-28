import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineEditorComponent } from './machine-editor.component';

describe('MachineEditorComponent', () => {
  let component: MachineEditorComponent;
  let fixture: ComponentFixture<MachineEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
