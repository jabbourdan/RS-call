import { TestBed } from '@angular/core/testing';

import { TradingVolumeService } from './trading-volume.service';

describe('TradingVolumeService', () => {
  let service: TradingVolumeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TradingVolumeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
