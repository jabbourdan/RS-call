import { TestBed } from '@angular/core/testing';

import { PatientDistributionService } from './patient-distribution.service';

describe('PatientDistributionService', () => {
  let service: PatientDistributionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientDistributionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
