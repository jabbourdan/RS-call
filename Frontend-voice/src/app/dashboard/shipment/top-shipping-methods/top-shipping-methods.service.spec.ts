import { TestBed } from '@angular/core/testing';

import { TopShippingMethodsService } from './top-shipping-methods.service';

describe('TopShippingMethodsService', () => {
  let service: TopShippingMethodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TopShippingMethodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
