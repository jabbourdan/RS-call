import { TestBed } from '@angular/core/testing';

import { OutboundCallsService } from './outbound-calls.service';

describe('OutboundCallsService', () => {
  let service: OutboundCallsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutboundCallsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
