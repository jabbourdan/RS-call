import { TestBed } from '@angular/core/testing';

import { TotalCallsService } from './total-calls.service';

describe('TotalCallsService', () => {
  let service: TotalCallsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TotalCallsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
