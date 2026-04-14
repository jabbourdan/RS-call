import { TestBed } from '@angular/core/testing';

import { SalesByCategoryService } from './sales-by-category.service';

describe('SalesByCategoryService', () => {
  let service: SalesByCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesByCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
