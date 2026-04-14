import { TestBed } from '@angular/core/testing';

import { SalesByGenderService } from './sales-by-gender.service';

describe('SalesByGenderService', () => {
  let service: SalesByGenderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesByGenderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
