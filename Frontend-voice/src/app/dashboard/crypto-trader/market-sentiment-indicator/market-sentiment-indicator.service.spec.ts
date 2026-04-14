import { TestBed } from '@angular/core/testing';

import { MarketSentimentIndicatorService } from './market-sentiment-indicator.service';

describe('MarketSentimentIndicatorService', () => {
  let service: MarketSentimentIndicatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketSentimentIndicatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
