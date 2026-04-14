import { TestBed } from '@angular/core/testing';

import { ListenerAnalytics2Service } from './listener-analytics2.service';

describe('ListenerAnalytics2Service', () => {
  let service: ListenerAnalytics2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListenerAnalytics2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
