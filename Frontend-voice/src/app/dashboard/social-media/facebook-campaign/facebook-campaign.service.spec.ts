import { TestBed } from '@angular/core/testing';

import { FacebookCampaignService } from './facebook-campaign.service';

describe('FacebookCampaignService', () => {
  let service: FacebookCampaignService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacebookCampaignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
