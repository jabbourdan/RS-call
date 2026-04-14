import { TestBed } from '@angular/core/testing';

import { ProductTradeConditionsService } from './product-trade-conditions.service';

describe('ProductTradeConditionsService', () => {
  let service: ProductTradeConditionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductTradeConditionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
