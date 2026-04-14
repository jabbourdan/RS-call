import { TestBed } from '@angular/core/testing';

import { TodaysShipmentsService } from './todays-shipments.service';

describe('TodaysShipmentsService', () => {
  let service: TodaysShipmentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodaysShipmentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
