import { TestBed } from '@angular/core/testing';

import { EmployeeAttendanceTrendsService } from './employee-attendance-trends.service';

describe('EmployeeAttendanceTrendsService', () => {
  let service: EmployeeAttendanceTrendsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeAttendanceTrendsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
