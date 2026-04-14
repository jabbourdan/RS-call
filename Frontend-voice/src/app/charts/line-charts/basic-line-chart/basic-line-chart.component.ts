import { Component } from "@angular/core";
import { BasicLineChartService } from "./basic-line-chart.service";

@Component({
    selector: 'app-basic-line-chart',
    imports: [],
    templateUrl: './basic-line-chart.component.html',
    styleUrl: './basic-line-chart.component.scss'
})
export class BasicLineChartComponent {

    constructor(
        private basicLineChartService: BasicLineChartService
    ) {}

    ngOnInit(): void {
        this.basicLineChartService.loadChart();
    }

}