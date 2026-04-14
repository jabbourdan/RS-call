import { TestBed } from '@angular/core/testing';

import { InstagramSubscribersService } from './instagram-subscribers.service';

describe('InstagramSubscribersService', () => {
  let service: InstagramSubscribersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstagramSubscribersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
