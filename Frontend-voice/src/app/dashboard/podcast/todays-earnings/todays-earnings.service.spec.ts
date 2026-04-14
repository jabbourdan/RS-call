import { TestBed } from '@angular/core/testing';

import { TodaysEarningsService } from './todays-earnings.service';

describe('TodaysEarningsService', () => {
  let service: TodaysEarningsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodaysEarningsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
