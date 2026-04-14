import { TestBed } from '@angular/core/testing';

import { EthereumRateService } from './ethereum-rate.service';

describe('EthereumRateService', () => {
  let service: EthereumRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EthereumRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
