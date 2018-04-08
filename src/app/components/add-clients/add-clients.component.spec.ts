/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddLitigantComponent } from './add-litigant.component';

describe('AddLitigantComponent', () => {
  let component: AddLitigantComponent;
  let fixture: ComponentFixture<AddLitigantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddLitigantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLitigantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
