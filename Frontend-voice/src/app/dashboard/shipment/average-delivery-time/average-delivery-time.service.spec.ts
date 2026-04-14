import { TestBed } from '@angular/core/testing';

import { AverageDeliveryTimeService } from './average-delivery-time.service';

describe('AverageDeliveryTimeService', () => {
  let service: AverageDeliveryTimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AverageDeliveryTimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
