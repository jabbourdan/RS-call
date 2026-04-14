import { Component, HostListener } from '@angular/core';
import { ListenerAnalyticsService } from './listener-analytics.service';
import { ListenerAnalytics2Service } from './listener-analytics2.service';

@Component({
    selector: 'app-listener-analytics',
    imports: [],
    templateUrl: './listener-analytics.component.html',
    styleUrl: './listener-analytics.component.scss'
})
export class ListenerAnalyticsComponent {

    selectedTimeframe: string = 'This Day'; // Default dropdown selection
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private listenerAnalyticsService: ListenerAnalyticsService,
        private listenerAnalytics2Service: ListenerAnalytics2Service
    ) {
        this.chartData = {
            'This Day': {
                series: [
                    { name: "Men", data: [50, 22, 25, 35, 20] },
                    { name: "Women", data: [20, 30, 18, 42, 15] }
                ],
                categories: ["18-24", "25-34", "35-44", "45-54", "55-64"]  // Age groups for the day
            },
            'This Week': {
                series: [
                    { name: "Men", data: [70, 60, 80, 90, 100, 110, 120] },
                    { name: "Women", data: [30, 40, 50, 60, 70, 80, 90] }
                ],
                categories: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+", "Other"]  // Age groups for the week
            },
            'This Month': {
                series: [
                    { name: "Men", data: [300, 350, 400, 450] },
                    { name: "Women", data: [200, 220, 240, 260] }
                ],
                categories: ["18-24", "25-34", "35-44", "45-54"]  // Age groups for the month
            },
            'This Year': {
                series: [
                    { name: "Men", data: [150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480] }, // Data for Men for 12 age groups
                    { name: "Women", data: [120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340] } // Data for Women for 12 age groups
                ],
                categories: [
                "18-24", "25-34", "35-44", "45-54", "55-64", "65+", "70+", "75+", "80+", "85+", "90+", "95+"  // 12 age groups
                ]  // 12 age categories for the year
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.listenerAnalyticsService.loadChart(defaultData.series, defaultData.categories);
        this.listenerAnalytics2Service.loadChart();
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.listenerAnalyticsService.updateChart(selectedData.series, selectedData.categories);
    }

    // Card Header Menu
    isCardHeaderOpen = false;
    toggleCardHeaderMenu() {
        this.isCardHeaderOpen = !this.isCardHeaderOpen;
    }
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.trezo-card-dropdown')) {
            this.isCardHeaderOpen = false;
        }
    }

}