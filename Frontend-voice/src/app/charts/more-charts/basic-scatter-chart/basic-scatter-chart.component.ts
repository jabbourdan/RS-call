import { Component } from '@angular/core';
import { BasicScatterChartService } from './basic-scatter-chart.service';

@Component({
    selector: 'app-basic-scatter-chart',
    imports: [],
    templateUrl: './basic-scatter-chart.component.html',
    styleUrl: './basic-scatter-chart.component.scss'
})
export class BasicScatterChartComponent {

    constructor(
        private basicScatterChartService: BasicScatterChartService
    ) {}

    ngOnInit(): void {
        this.basicScatterChartService.loadChart();
    }

}