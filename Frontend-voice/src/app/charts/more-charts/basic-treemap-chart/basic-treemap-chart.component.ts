import { Component } from '@angular/core';
import { BasicTreemapChartService } from './basic-treemap-chart.service';

@Component({
    selector: 'app-basic-treemap-chart',
    imports: [],
    templateUrl: './basic-treemap-chart.component.html',
    styleUrl: './basic-treemap-chart.component.scss'
})
export class BasicTreemapChartComponent {

    constructor(
        private basicTreemapChartService: BasicTreemapChartService
    ) {}

    ngOnInit(): void {
        this.basicTreemapChartService.loadChart();
    }

}