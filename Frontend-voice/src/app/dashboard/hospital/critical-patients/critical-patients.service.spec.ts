import { TestBed } from '@angular/core/testing';

import { CriticalPatientsService } from './critical-patients.service';

describe('CriticalPatientsService', () => {
  let service: CriticalPatientsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CriticalPatientsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
