import { TestBed } from '@angular/core/testing';

import { InstagramCampaignsService } from './instagram-campaigns.service';

describe('InstagramCampaignsService', () => {
  let service: InstagramCampaignsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstagramCampaignsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
