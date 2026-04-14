import { Component } from '@angular/core';
import { LineAreaChartService } from './line-area-chart.service';

@Component({
    selector: 'app-line-area-chart',
    imports: [],
    templateUrl: './line-area-chart.component.html',
    styleUrl: './line-area-chart.component.scss'
})
export class LineAreaChartComponent {

    constructor(
        private lineAreaChartService: LineAreaChartService
    ) {}

    ngOnInit(): void {
        this.lineAreaChartService.loadChart();
    }

}