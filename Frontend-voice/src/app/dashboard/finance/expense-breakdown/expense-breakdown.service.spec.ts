import { TestBed } from '@angular/core/testing';

import { ExpenseBreakdownService } from './expense-breakdown.service';

describe('ExpenseBreakdownService', () => {
  let service: ExpenseBreakdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseBreakdownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
