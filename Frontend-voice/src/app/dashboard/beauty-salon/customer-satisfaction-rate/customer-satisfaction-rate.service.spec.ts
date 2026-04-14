import { TestBed } from '@angular/core/testing';

import { CustomerSatisfactionRateService } from './customer-satisfaction-rate.service';

describe('CustomerSatisfactionRateService', () => {
  let service: CustomerSatisfactionRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerSatisfactionRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
