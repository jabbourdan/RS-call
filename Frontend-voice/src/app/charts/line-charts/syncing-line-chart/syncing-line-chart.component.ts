import { Component } from '@angular/core';
import { SyncingLineChartService } from './syncing-line-chart.service';

@Component({
    selector: 'app-syncing-line-chart',
    imports: [],
    templateUrl: './syncing-line-chart.component.html',
    styleUrl: './syncing-line-chart.component.scss'
})
export class SyncingLineChartComponent {

    constructor(
        private syncingLineChartService: SyncingLineChartService
    ) {}

    ngOnInit(): void {
        this.syncingLineChartService.loadChart();
    }

}