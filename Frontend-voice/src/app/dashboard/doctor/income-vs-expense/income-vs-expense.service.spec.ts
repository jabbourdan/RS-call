import { TestBed } from '@angular/core/testing';

import { IncomeVsExpenseService } from './income-vs-expense.service';

describe('IncomeVsExpenseService', () => {
  let service: IncomeVsExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncomeVsExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
