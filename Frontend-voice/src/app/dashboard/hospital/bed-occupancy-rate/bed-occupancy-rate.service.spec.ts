import { TestBed } from '@angular/core/testing';

import { BedOccupancyRateService } from './bed-occupancy-rate.service';

describe('BedOccupancyRateService', () => {
  let service: BedOccupancyRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BedOccupancyRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
