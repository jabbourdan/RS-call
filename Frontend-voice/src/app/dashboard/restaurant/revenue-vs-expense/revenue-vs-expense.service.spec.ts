import { TestBed } from '@angular/core/testing';

import { RevenueVsExpenseService } from './revenue-vs-expense.service';

describe('RevenueVsExpenseService', () => {
  let service: RevenueVsExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RevenueVsExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
