import { TestBed } from '@angular/core/testing';

import { TotalEarningsService } from './total-earnings.service';

describe('TotalEarningsService', () => {
  let service: TotalEarningsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TotalEarningsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
