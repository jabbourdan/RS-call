import { TestBed } from '@angular/core/testing';

import { ResponseTimeService } from './response-time.service';

describe('ResponseTimeService', () => {
  let service: ResponseTimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponseTimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
