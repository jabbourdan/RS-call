import { TestBed } from '@angular/core/testing';

import { PerformanceOverviewService } from './performance-overview.service';

describe('PerformanceOverviewService', () => {
  let service: PerformanceOverviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformanceOverviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
