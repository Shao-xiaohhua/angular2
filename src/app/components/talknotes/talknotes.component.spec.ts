/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TalknotesComponent } from './talknotes.component';

describe('TalknotesComponent', () => {
  let component: TalknotesComponent;
  let fixture: ComponentFixture<TalknotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TalknotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TalknotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
