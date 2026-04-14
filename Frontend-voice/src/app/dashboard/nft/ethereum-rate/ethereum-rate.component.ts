import { Component } from '@angular/core';
import { EthereumRateService } from './ethereum-rate.service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-ethereum-rate',
    imports: [NgClass],
    templateUrl: './ethereum-rate.component.html',
    styleUrl: './ethereum-rate.component.scss'
})
export class EthereumRateComponent {

    constructor(
        private ethereumRateService: EthereumRateService
    ) {}

    activeTimeframe: string = '1y'; // Default active timeframe
    categories: string[] = []; // Holds x-axis categories
    seriesData: number[] = []; // Holds series data

    ngOnInit(): void {
        this.updateChart('1y'); // Load the default chart for 1 year
    }

    onTimeframeChange(timeframe: string): void {
        this.activeTimeframe = timeframe; // Update the active button
        this.updateChart(timeframe);
    }

    private updateChart(timeframe: string): void {
        switch (timeframe) {
            case '1d':
                this.seriesData = [10, 20, 15, 25, 30];
                this.categories = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM'];
                break;

            case '1w':
                this.seriesData = [40, 30, 50, 60, 70, 80, 90];
                this.categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                break;

            case '1m':
                this.seriesData = [20, 30, 40, 50];
                this.categories = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                break;

            case '1y':
                this.seriesData = [20, 40, 60, 60, 50, 30, 40, 30, 40, 40, 60, 60];
                this.categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                break;
        }
        // Pass the updated series and categories to the service
        this.ethereumRateService.loadChart(this.seriesData, this.categories);
    }

}