import { Component } from '@angular/core';
import { MultipleRadarChartService } from './multiple-radar-chart.service';

@Component({
    selector: 'app-multiple-radar-chart',
    imports: [],
    templateUrl: './multiple-radar-chart.component.html',
    styleUrl: './multiple-radar-chart.component.scss'
})
export class MultipleRadarChartComponent {

    constructor(
        private multipleRadarChartService: MultipleRadarChartService
    ) {}

    ngOnInit(): void {
        this.multipleRadarChartService.loadChart();
    }

}