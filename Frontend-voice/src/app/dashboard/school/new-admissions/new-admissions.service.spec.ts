import { TestBed } from '@angular/core/testing';

import { NewAdmissionsService } from './new-admissions.service';

describe('NewAdmissionsService', () => {
  let service: NewAdmissionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewAdmissionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
