import { TestBed } from '@angular/core/testing';

import { PerformancePerInvestmentService } from './performance-per-investment.service';

describe('PerformancePerInvestmentService', () => {
  let service: PerformancePerInvestmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformancePerInvestmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
