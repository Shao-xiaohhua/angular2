/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DraftCalibrateComponent } from './draft-calibrate.component';

describe('DraftDiffComponent', () => {
  let component: DraftCalibrateComponent;
  let fixture: ComponentFixture<DraftCalibrateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DraftCalibrateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DraftCalibrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
