import { TestBed } from '@angular/core/testing';

import { ResignedEmployeesService } from './resigned-employees.service';

describe('ResignedEmployeesService', () => {
  let service: ResignedEmployeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResignedEmployeesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
