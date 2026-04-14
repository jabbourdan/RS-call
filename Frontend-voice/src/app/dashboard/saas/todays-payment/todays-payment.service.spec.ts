import { TestBed } from '@angular/core/testing';

import { TodaysPaymentService } from './todays-payment.service';

describe('TodaysPaymentService', () => {
  let service: TodaysPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodaysPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
