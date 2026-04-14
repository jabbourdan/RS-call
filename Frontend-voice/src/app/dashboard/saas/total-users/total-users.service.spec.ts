import { TestBed } from '@angular/core/testing';

import { TotalUsersService } from './total-users.service';

describe('TotalUsersService', () => {
  let service: TotalUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TotalUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
