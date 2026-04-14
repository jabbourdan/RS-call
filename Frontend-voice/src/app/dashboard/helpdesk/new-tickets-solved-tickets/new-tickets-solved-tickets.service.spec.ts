import { TestBed } from '@angular/core/testing';

import { NewTicketsSolvedTicketsService } from './new-tickets-solved-tickets.service';

describe('NewTicketsSolvedTicketsService', () => {
  let service: NewTicketsSolvedTicketsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewTicketsSolvedTicketsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
