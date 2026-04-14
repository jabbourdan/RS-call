import { TestBed } from '@angular/core/testing';

import { AttendanceAnalyticsService } from './attendance-analytics.service';

describe('AttendanceAnalyticsService', () => {
  let service: AttendanceAnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttendanceAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
