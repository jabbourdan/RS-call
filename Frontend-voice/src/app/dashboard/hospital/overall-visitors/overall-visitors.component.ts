import { Component } from '@angular/core';
import { OverallVisitorsService } from './overall-visitors.service';

@Component({
    selector: 'app-overall-visitors',
    imports: [],
    templateUrl: './overall-visitors.component.html',
    styleUrl: './overall-visitors.component.scss'
})
export class OverallVisitorsComponent {

    constructor(
        private overallVisitorsService: OverallVisitorsService
    ) {}

    ngOnInit(): void {
        this.overallVisitorsService.loadChart();
    }

}