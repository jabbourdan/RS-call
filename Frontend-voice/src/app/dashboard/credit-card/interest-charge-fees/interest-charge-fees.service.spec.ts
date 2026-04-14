import { TestBed } from '@angular/core/testing';

import { InterestChargeFeesService } from './interest-charge-fees.service';

describe('InterestChargeFeesService', () => {
  let service: InterestChargeFeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterestChargeFeesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
