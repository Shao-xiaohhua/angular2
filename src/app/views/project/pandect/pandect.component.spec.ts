/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PandectComponent } from './pandect.component';

describe('PandectComponent', () => {
  let component: PandectComponent;
  let fixture: ComponentFixture<PandectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PandectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PandectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
