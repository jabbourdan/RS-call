import { TestBed } from '@angular/core/testing';

import { CreditUtilizationRatioService } from './credit-utilization-ratio.service';

describe('CreditUtilizationRatioService', () => {
  let service: CreditUtilizationRatioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditUtilizationRatioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
