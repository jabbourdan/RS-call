import { Component } from '@angular/core';
import { BasicPolarChartService } from './basic-polar-chart.service';

@Component({
    selector: 'app-basic-polar-chart',
    imports: [],
    templateUrl: './basic-polar-chart.component.html',
    styleUrl: './basic-polar-chart.component.scss'
})
export class BasicPolarChartComponent {

    constructor(
        private basicPolarChartService: BasicPolarChartService
    ) {}

    ngOnInit(): void {
        this.basicPolarChartService.loadChart();
    }

}