import { Component } from '@angular/core';
import { StackedColumnChartService } from './stacked-column-chart.service';

@Component({
    selector: 'app-stacked-column-chart',
    imports: [],
    templateUrl: './stacked-column-chart.component.html',
    styleUrl: './stacked-column-chart.component.scss'
})
export class StackedColumnChartComponent {

    constructor(
        private stackedColumnChartService: StackedColumnChartService
    ) {}

    ngOnInit(): void {
        this.stackedColumnChartService.loadChart();
    }

}