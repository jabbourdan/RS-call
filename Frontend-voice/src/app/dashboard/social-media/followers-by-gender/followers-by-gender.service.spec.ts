import { TestBed } from '@angular/core/testing';

import { FollowersByGenderService } from './followers-by-gender.service';

describe('FollowersByGenderService', () => {
  let service: FollowersByGenderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FollowersByGenderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
