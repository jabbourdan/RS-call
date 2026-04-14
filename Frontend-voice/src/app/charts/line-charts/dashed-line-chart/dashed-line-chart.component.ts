import { Component } from "@angular/core";
import { DashedLineChartService } from "./dashed-line-chart.service";

@Component({
    selector: 'app-dashed-line-chart',
    imports: [],
    templateUrl: './dashed-line-chart.component.html',
    styleUrl: './dashed-line-chart.component.scss'
})
export class DashedLineChartComponent {

    constructor(
        private dashedLineChartService: DashedLineChartService
    ) {}

    ngOnInit(): void {
        this.dashedLineChartService.loadChart();
    }

}