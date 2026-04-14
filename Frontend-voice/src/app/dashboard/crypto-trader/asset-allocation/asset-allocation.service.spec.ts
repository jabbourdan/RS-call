import { TestBed } from '@angular/core/testing';

import { AssetAllocationService } from './asset-allocation.service';

describe('AssetAllocationService', () => {
  let service: AssetAllocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssetAllocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
