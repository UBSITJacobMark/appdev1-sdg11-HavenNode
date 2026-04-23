import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wind } from './wind.component';

describe('Wind', () => {
  let component: Wind;
  let fixture: ComponentFixture<Wind>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wind],
    }).compileComponents();

    fixture = TestBed.createComponent(Wind);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
