import { TestBed } from '@angular/core/testing';

import { TradesPerMonthService } from './trades-per-month.service';

describe('TradesPerMonthService', () => {
  let service: TradesPerMonthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TradesPerMonthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
