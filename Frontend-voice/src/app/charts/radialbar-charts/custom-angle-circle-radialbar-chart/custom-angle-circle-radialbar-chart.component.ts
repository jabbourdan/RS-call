import { Component } from '@angular/core';
import { CustomAngleCircleRadialbarChartService } from './custom-angle-circle-radialbar-chart.service';

@Component({
    selector: 'app-custom-angle-circle-radialbar-chart',
    imports: [],
    templateUrl: './custom-angle-circle-radialbar-chart.component.html',
    styleUrl: './custom-angle-circle-radialbar-chart.component.scss'
})
export class CustomAngleCircleRadialbarChartComponent {

    constructor(
        private customAngleCircleRadialbarChartService: CustomAngleCircleRadialbarChartService
    ) {}

    ngOnInit(): void {
        this.customAngleCircleRadialbarChartService.loadChart();
    }

}