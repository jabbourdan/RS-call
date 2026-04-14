import { TestBed } from '@angular/core/testing';

import { SupportOverviewService } from './support-overview.service';

describe('SupportOverviewService', () => {
  let service: SupportOverviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupportOverviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
