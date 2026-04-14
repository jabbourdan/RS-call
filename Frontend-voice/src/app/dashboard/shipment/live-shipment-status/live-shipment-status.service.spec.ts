import { TestBed } from '@angular/core/testing';

import { LiveShipmentStatusService } from './live-shipment-status.service';

describe('LiveShipmentStatusService', () => {
  let service: LiveShipmentStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveShipmentStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
