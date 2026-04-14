import { TestBed } from '@angular/core/testing';

import { TotalEmployeesService } from './total-employees.service';

describe('TotalEmployeesService', () => {
  let service: TotalEmployeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TotalEmployeesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
