import { TestBed } from '@angular/core/testing';

import { NewSoldPropertiesService } from './new-sold-properties.service';

describe('NewSoldPropertiesService', () => {
  let service: NewSoldPropertiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewSoldPropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
