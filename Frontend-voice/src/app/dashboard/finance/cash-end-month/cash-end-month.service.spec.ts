import { TestBed } from '@angular/core/testing';

import { CashEndMonthService } from './cash-end-month.service';

describe('CashEndMonthService', () => {
  let service: CashEndMonthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashEndMonthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
