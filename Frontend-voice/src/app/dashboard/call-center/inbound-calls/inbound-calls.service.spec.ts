import { TestBed } from '@angular/core/testing';

import { InboundCallsService } from './inbound-calls.service';

describe('InboundCallsService', () => {
  let service: InboundCallsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InboundCallsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
