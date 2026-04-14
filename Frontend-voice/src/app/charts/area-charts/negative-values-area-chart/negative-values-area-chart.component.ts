import { Component } from '@angular/core';
import { NegativeValuesAreaChartService } from './negative-values-area-chart.service';

@Component({
    selector: 'app-negative-values-area-chart',
    imports: [],
    templateUrl: './negative-values-area-chart.component.html',
    styleUrl: './negative-values-area-chart.component.scss'
})
export class NegativeValuesAreaChartComponent {

    constructor(
        private negativeValuesAreaChartService: NegativeValuesAreaChartService
    ) {}

    ngOnInit(): void {
        this.negativeValuesAreaChartService.loadChart();
    }

}