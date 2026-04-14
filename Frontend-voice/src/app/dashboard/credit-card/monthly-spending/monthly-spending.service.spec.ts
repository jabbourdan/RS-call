import { TestBed } from '@angular/core/testing';

import { MonthlySpendingService } from './monthly-spending.service';

describe('MonthlySpendingService', () => {
  let service: MonthlySpendingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonthlySpendingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
