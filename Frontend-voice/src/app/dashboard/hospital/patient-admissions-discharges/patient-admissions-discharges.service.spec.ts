import { TestBed } from '@angular/core/testing';

import { PatientAdmissionsDischargesService } from './patient-admissions-discharges.service';

describe('PatientAdmissionsDischargesService', () => {
  let service: PatientAdmissionsDischargesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientAdmissionsDischargesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
