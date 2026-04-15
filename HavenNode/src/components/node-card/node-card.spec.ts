import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeCard } from './node-card';

describe('NodeCard', () => {
  let component: NodeCard;
  let fixture: ComponentFixture<NodeCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeCard],
    }).compileComponents();

    fixture = TestBed.createComponent(NodeCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
