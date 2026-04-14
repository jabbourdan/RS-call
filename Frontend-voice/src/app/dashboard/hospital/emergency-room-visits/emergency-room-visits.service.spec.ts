import { TestBed } from '@angular/core/testing';

import { EmergencyRoomVisitsService } from './emergency-room-visits.service';

describe('EmergencyRoomVisitsService', () => {
  let service: EmergencyRoomVisitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmergencyRoomVisitsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
