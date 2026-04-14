import { TestBed } from '@angular/core/testing';

import { EmployeeWorkFormatService } from './employee-work-format.service';

describe('EmployeeWorkFormatService', () => {
  let service: EmployeeWorkFormatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeWorkFormatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
