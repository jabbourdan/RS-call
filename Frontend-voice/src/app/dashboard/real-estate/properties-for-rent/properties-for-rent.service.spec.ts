import { TestBed } from '@angular/core/testing';

import { PropertiesForRentService } from './properties-for-rent.service';

describe('PropertiesForRentService', () => {
  let service: PropertiesForRentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertiesForRentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
