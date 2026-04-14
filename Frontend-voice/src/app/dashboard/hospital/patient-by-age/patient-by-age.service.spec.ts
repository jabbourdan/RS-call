import { TestBed } from '@angular/core/testing';

import { PatientByAgeService } from './patient-by-age.service';

describe('PatientByAgeService', () => {
  let service: PatientByAgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientByAgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
