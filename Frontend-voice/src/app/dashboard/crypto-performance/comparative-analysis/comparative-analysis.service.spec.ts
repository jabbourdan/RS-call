import { TestBed } from '@angular/core/testing';

import { ComparativeAnalysisService } from './comparative-analysis.service';

describe('ComparativeAnalysisService', () => {
  let service: ComparativeAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComparativeAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
