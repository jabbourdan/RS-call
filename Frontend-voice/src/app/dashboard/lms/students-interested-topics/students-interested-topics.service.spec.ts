import { TestBed } from '@angular/core/testing';

import { StudentsInterestedTopicsService } from './students-interested-topics.service';

describe('StudentsInterestedTopicsService', () => {
  let service: StudentsInterestedTopicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentsInterestedTopicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
