import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Flood } from './flood.component';

describe('Flood', () => {
  let component: Flood;
  let fixture: ComponentFixture<Flood>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Flood],
    }).compileComponents();

    fixture = TestBed.createComponent(Flood);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
