import { Component } from '@angular/core';
import { BasicTimelineChartService } from './basic-timeline-chart.service';

@Component({
    selector: 'app-basic-timeline-chart',
    imports: [],
    templateUrl: './basic-timeline-chart.component.html',
    styleUrl: './basic-timeline-chart.component.scss'
})
export class BasicTimelineChartComponent {

    constructor(
        private basicTimelineChartService: BasicTimelineChartService
    ) {}

    ngOnInit(): void {
        this.basicTimelineChartService.loadChart();
    }

}