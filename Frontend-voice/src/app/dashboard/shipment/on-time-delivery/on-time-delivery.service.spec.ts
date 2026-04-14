import { TestBed } from '@angular/core/testing';

import { OnTimeDeliveryService } from './on-time-delivery.service';

describe('OnTimeDeliveryService', () => {
  let service: OnTimeDeliveryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnTimeDeliveryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
