import { TestBed } from '@angular/core/testing';

import { CustomerSegmentationService } from './customer-segmentation.service';

describe('CustomerSegmentationService', () => {
  let service: CustomerSegmentationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerSegmentationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
