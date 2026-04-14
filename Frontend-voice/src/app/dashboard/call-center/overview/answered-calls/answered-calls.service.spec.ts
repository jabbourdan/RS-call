import { TestBed } from '@angular/core/testing';

import { AnsweredCallsService } from './answered-calls.service';

describe('AnsweredCallsService', () => {
  let service: AnsweredCallsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnsweredCallsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
