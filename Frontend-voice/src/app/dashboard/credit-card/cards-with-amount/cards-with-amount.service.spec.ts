import { TestBed } from '@angular/core/testing';

import { CardsWithAmountService } from './cards-with-amount.service';

describe('CardsWithAmountService', () => {
  let service: CardsWithAmountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardsWithAmountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
