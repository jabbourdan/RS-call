import { TestBed } from '@angular/core/testing';

import { ListenerAnalyticsService } from './listener-analytics.service';

describe('ListenerAnalyticsService', () => {
  let service: ListenerAnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListenerAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
