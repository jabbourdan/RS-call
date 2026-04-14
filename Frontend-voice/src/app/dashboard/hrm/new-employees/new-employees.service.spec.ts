import { TestBed } from '@angular/core/testing';

import { NewEmployeesService } from './new-employees.service';

describe('NewEmployeesService', () => {
  let service: NewEmployeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewEmployeesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
