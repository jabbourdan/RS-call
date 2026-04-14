import { Component } from '@angular/core';
import { LineColumnChartService } from './line-column-chart.service';

@Component({
    selector: 'app-line-column-chart',
    imports: [],
    templateUrl: './line-column-chart.component.html',
    styleUrl: './line-column-chart.component.scss'
})
export class LineColumnChartComponent {

    constructor(
        private lineColumnChartService: LineColumnChartService
    ) {}

    ngOnInit(): void {
        this.lineColumnChartService.loadChart();
    }

}