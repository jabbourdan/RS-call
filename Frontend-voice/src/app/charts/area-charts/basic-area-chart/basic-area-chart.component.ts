import { Component } from '@angular/core';
import { BasicAreaChartService } from './basic-area-chart.service';

@Component({
    selector: 'app-basic-area-chart',
    imports: [],
    templateUrl: './basic-area-chart.component.html',
    styleUrl: './basic-area-chart.component.scss'
})
export class BasicAreaChartComponent {

    constructor(
        private basicAreaChartService: BasicAreaChartService
    ) {}

    ngOnInit(): void {
        this.basicAreaChartService.loadChart();
    }

}