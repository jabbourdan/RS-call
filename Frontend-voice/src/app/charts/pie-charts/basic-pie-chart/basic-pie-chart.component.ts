import { Component } from '@angular/core';
import { BasicPieChartService } from './basic-pie-chart.service';

@Component({
    selector: 'app-basic-pie-chart',
    imports: [],
    templateUrl: './basic-pie-chart.component.html',
    styleUrl: './basic-pie-chart.component.scss'
})
export class BasicPieChartComponent {

    constructor(
        private basicPieChartService: BasicPieChartService
    ) {}

    ngOnInit(): void {
        this.basicPieChartService.loadChart();
    }

}