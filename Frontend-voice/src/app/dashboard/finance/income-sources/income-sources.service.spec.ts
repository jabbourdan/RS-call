import { TestBed } from '@angular/core/testing';

import { IncomeSourcesService } from './income-sources.service';

describe('IncomeSourcesService', () => {
  let service: IncomeSourcesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncomeSourcesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
