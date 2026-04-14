import { Component } from '@angular/core';
import { MultipleYaxisChartService } from './multiple-yaxis-chart.service';

@Component({
    selector: 'app-multiple-yaxis-chart',
    imports: [],
    templateUrl: './multiple-yaxis-chart.component.html',
    styleUrl: './multiple-yaxis-chart.component.scss'
})
export class MultipleYaxisChartComponent {

    constructor(
        private multipleYaxisChartService: MultipleYaxisChartService
    ) {}

    ngOnInit(): void {
        this.multipleYaxisChartService.loadChart();
    }

}