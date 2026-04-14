import { TestBed } from '@angular/core/testing';

import { PatientsLast7DaysService } from './patients-last-7-days.service';

describe('PatientsLast7DaysService', () => {
  let service: PatientsLast7DaysService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientsLast7DaysService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
