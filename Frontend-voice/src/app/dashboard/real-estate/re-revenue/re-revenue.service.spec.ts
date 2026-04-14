import { TestBed } from '@angular/core/testing';

import { ReRevenueService } from './re-revenue.service';

describe('ReRevenueService', () => {
  let service: ReRevenueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReRevenueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
