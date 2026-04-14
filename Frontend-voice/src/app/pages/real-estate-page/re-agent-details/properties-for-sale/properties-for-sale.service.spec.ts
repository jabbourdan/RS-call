import { TestBed } from '@angular/core/testing';

import { PropertiesForSaleService } from './properties-for-sale.service';

describe('PropertiesForSaleService', () => {
  let service: PropertiesForSaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertiesForSaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
