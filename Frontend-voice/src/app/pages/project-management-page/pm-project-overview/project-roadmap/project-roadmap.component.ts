import { Component } from '@angular/core';
import { ProjectRoadmapService } from './project-roadmap.service';

@Component({
    selector: 'app-project-roadmap',
    imports: [],
    templateUrl: './project-roadmap.component.html',
    styleUrl: './project-roadmap.component.scss'
})
export class ProjectRoadmapComponent {

    constructor(
        private projectRoadmapService: ProjectRoadmapService
    ) {}

    ngOnInit(): void {
        this.projectRoadmapService.loadChart();
    }

}