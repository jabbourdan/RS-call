import { TestBed } from '@angular/core/testing';

import { GrossRevenueService } from './gross-revenue.service';

describe('GrossRevenueService', () => {
  let service: GrossRevenueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrossRevenueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
