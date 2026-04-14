import { TestBed } from '@angular/core/testing';

import { MissedCallsService } from './missed-calls.service';

describe('MissedCallsService', () => {
  let service: MissedCallsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MissedCallsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
