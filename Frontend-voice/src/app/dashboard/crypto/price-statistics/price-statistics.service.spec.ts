import { TestBed } from '@angular/core/testing';

import { PriceStatisticsService } from './price-statistics.service';

describe('PriceStatisticsService', () => {
  let service: PriceStatisticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceStatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
