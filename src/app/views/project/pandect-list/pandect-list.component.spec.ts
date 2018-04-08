/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PandectListComponent } from './pandect-list.component';

describe('PandectListComponent', () => {
  let component: PandectListComponent;
  let fixture: ComponentFixture<PandectListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PandectListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PandectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
