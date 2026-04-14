import { TestBed } from '@angular/core/testing';

import { MarketPerformanceService } from './market-performance.service';

describe('MarketPerformanceService', () => {
  let service: MarketPerformanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketPerformanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
