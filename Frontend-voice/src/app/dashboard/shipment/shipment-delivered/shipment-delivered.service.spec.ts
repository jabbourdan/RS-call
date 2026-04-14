import { TestBed } from '@angular/core/testing';

import { ShipmentDeliveredService } from './shipment-delivered.service';

describe('ShipmentDeliveredService', () => {
  let service: ShipmentDeliveredService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShipmentDeliveredService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
