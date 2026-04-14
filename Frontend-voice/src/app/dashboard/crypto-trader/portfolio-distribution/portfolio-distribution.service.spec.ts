import { TestBed } from '@angular/core/testing';

import { PortfolioDistributionService } from './portfolio-distribution.service';

describe('PortfolioDistributionService', () => {
  let service: PortfolioDistributionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioDistributionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
