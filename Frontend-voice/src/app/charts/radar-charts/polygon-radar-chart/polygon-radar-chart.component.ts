import { Component } from '@angular/core';
import { PolygonRadarChartService } from './polygon-radar-chart.service';

@Component({
    selector: 'app-polygon-radar-chart',
    imports: [],
    templateUrl: './polygon-radar-chart.component.html',
    styleUrl: './polygon-radar-chart.component.scss'
})
export class PolygonRadarChartComponent {

    constructor(
        private polygonRadarChartService: PolygonRadarChartService
    ) {}

    ngOnInit(): void {
        this.polygonRadarChartService.loadChart();
    }

}