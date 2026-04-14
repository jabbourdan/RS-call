import { TestBed } from '@angular/core/testing';

import { NetProfitService } from './net-profit.service';

describe('NetProfitService', () => {
  let service: NetProfitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetProfitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
