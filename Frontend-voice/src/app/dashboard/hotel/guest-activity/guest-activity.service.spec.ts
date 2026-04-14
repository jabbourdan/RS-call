import { TestBed } from '@angular/core/testing';

import { GuestActivityService } from './guest-activity.service';

describe('GuestActivityService', () => {
  let service: GuestActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuestActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
