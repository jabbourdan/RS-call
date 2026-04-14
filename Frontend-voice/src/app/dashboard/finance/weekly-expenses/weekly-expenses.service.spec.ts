import { TestBed } from '@angular/core/testing';

import { WeeklyExpensesService } from './weekly-expenses.service';

describe('WeeklyExpensesService', () => {
  let service: WeeklyExpensesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeeklyExpensesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
