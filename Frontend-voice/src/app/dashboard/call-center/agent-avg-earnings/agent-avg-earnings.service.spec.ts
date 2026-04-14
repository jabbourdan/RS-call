import { TestBed } from '@angular/core/testing';

import { AgentAvgEarningsService } from './agent-avg-earnings.service';

describe('AgentAvgEarningsService', () => {
  let service: AgentAvgEarningsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentAvgEarningsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
