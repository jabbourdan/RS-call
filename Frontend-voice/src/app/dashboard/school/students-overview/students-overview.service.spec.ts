import { TestBed } from '@angular/core/testing';

import { StudentsOverviewService } from './students-overview.service';

describe('StudentsOverviewService', () => {
  let service: StudentsOverviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentsOverviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
