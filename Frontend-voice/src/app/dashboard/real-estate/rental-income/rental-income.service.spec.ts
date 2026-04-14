import { TestBed } from '@angular/core/testing';

import { RentalIncomeService } from './rental-income.service';

describe('RentalIncomeService', () => {
  let service: RentalIncomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RentalIncomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
