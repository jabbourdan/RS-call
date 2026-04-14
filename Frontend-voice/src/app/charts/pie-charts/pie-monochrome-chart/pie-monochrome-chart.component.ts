import { Component } from '@angular/core';
import { PieMonochromeChartService } from './pie-monochrome-chart.service';

@Component({
    selector: 'app-pie-monochrome-chart',
    imports: [],
    templateUrl: './pie-monochrome-chart.component.html',
    styleUrl: './pie-monochrome-chart.component.scss'
})
export class PieMonochromeChartComponent {

    constructor(
        private pieMonochromeChartService: PieMonochromeChartService
    ) {}

    ngOnInit(): void {
        this.pieMonochromeChartService.loadChart();
    }

}