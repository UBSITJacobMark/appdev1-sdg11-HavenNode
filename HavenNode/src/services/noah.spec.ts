import { TestBed } from '@angular/core/testing';

import { Noah } from './noah';

describe('Noah', () => {
  let service: Noah;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Noah);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
