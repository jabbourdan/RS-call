import { TestBed } from '@angular/core/testing';

import { RiskExposureService } from './risk-exposure.service';

describe('RiskExposureService', () => {
  let service: RiskExposureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RiskExposureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
