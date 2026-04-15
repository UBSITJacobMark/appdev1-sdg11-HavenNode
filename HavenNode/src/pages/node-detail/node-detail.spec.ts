import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeDetail } from './node-detail';

describe('NodeDetail', () => {
  let component: NodeDetail;
  let fixture: ComponentFixture<NodeDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(NodeDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
