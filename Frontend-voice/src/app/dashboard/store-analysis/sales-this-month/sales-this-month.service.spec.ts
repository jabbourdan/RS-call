import { TestBed } from '@angular/core/testing';

import { SalesThisMonthService } from './sales-this-month.service';

describe('SalesThisMonthService', () => {
  let service: SalesThisMonthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesThisMonthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
