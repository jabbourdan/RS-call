import { TestBed } from '@angular/core/testing';

import { PatientRetentionService } from './patient-retention.service';

describe('PatientRetentionService', () => {
  let service: PatientRetentionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientRetentionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
