import { TestBed } from '@angular/core/testing';

import { SpendingBreakdownService } from './spending-breakdown.service';

describe('SpendingBreakdownService', () => {
  let service: SpendingBreakdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpendingBreakdownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
