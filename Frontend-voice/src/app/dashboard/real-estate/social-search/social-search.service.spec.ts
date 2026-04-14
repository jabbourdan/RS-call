import { TestBed } from '@angular/core/testing';

import { SocialSearchService } from './social-search.service';

describe('SocialSearchService', () => {
  let service: SocialSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocialSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
