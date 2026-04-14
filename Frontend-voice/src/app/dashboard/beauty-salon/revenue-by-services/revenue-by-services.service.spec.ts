import { TestBed } from '@angular/core/testing';

import { RevenueByServicesService } from './revenue-by-services.service';

describe('RevenueByServicesService', () => {
  let service: RevenueByServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RevenueByServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
