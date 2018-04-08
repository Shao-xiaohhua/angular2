/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DraftDiffComponent } from './draft-diff.component';

describe('DraftDiffComponent', () => {
  let component: DraftDiffComponent;
  let fixture: ComponentFixture<DraftDiffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DraftDiffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DraftDiffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
