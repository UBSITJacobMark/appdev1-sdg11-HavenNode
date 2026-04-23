import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Precipitation } from './precipitation.component';

describe('Precipitation', () => {
  let component: Precipitation;
  let fixture: ComponentFixture<Precipitation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Precipitation],
    }).compileComponents();

    fixture = TestBed.createComponent(Precipitation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
