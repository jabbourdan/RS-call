import { TestBed } from '@angular/core/testing';

import { ProjectRoadmapService } from './project-roadmap.service';

describe('ProjectRoadmapService', () => {
  let service: ProjectRoadmapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectRoadmapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
