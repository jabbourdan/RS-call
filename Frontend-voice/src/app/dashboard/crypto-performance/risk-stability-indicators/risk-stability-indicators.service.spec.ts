import { TestBed } from '@angular/core/testing';

import { RiskStabilityIndicatorsService } from './risk-stability-indicators.service';

describe('RiskStabilityIndicatorsService', () => {
  let service: RiskStabilityIndicatorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RiskStabilityIndicatorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
