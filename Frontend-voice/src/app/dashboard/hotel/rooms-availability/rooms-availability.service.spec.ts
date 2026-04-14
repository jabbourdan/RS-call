import { TestBed } from '@angular/core/testing';

import { RoomsAvailabilityService } from './rooms-availability.service';

describe('RoomsAvailabilityService', () => {
  let service: RoomsAvailabilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomsAvailabilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
