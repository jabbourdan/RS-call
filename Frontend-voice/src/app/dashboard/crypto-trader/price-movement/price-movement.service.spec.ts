import { TestBed } from '@angular/core/testing';

import { PriceMovementService } from './price-movement.service';

describe('PriceMovementService', () => {
  let service: PriceMovementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceMovementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
