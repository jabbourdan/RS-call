import { Component } from '@angular/core';
import { LineColumnAreaChartService } from './line-column-area-chart.service';

@Component({
    selector: 'app-line-column-area-chart',
    imports: [],
    templateUrl: './line-column-area-chart.component.html',
    styleUrl: './line-column-area-chart.component.scss'
})
export class LineColumnAreaChartComponent {

    constructor(
        private lineColumnAreaChartService: LineColumnAreaChartService
    ) {}

    ngOnInit(): void {
        this.lineColumnAreaChartService.loadChart();
    }

}