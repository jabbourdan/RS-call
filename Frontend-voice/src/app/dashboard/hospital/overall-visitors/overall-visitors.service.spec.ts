import { TestBed } from '@angular/core/testing';

import { OverallVisitorsService } from './overall-visitors.service';

describe('OverallVisitorsService', () => {
  let service: OverallVisitorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverallVisitorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
