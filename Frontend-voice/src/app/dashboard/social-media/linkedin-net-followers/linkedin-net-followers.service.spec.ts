import { TestBed } from '@angular/core/testing';

import { LinkedinNetFollowersService } from './linkedin-net-followers.service';

describe('LinkedinNetFollowersService', () => {
  let service: LinkedinNetFollowersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LinkedinNetFollowersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
