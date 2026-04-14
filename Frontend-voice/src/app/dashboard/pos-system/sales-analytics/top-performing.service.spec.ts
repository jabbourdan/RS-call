import { TestBed } from '@angular/core/testing';

import { TopPerformingService } from './top-performing.service';

describe('TopPerformingService', () => {
  let service: TopPerformingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TopPerformingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
