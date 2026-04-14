import { Component, HostListener } from '@angular/core';
import { RevenueByServicesService } from './revenue-by-services.service';

@Component({
    selector: 'app-revenue-by-services',
    imports: [],
    templateUrl: './revenue-by-services.component.html',
    styleUrl: './revenue-by-services.component.scss'
})
export class RevenueByServicesComponent {

    selectedTimeframe: string = 'Monthly'; // Default selection
    chartData: { [key: string]: { series: { name: string; data: number[] }[], categories: string[] } };

    constructor(
        private revenueByServicesService: RevenueByServicesService
    ) {
        this.chartData = {
            'Daily': {
                series: [
                    { name: "Facial", data: [5, 7, 6, 8, 6, 7, 5] },
                    { name: "Manicure", data: [2, 3, 4, 3, 2, 3, 4] },
                    { name: "Pedicure", data: [1, 2, 2, 1, 2, 3, 2] },
                    { name: "Hair Cut", data: [3, 4, 5, 4, 3, 4, 3] }
                ],
                categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            },
            'Weekly': {
                series: [
                    { name: "Facial", data: [40, 45, 50, 55] },
                    { name: "Manicure", data: [15, 20, 18, 22] },
                    { name: "Pedicure", data: [10, 12, 15, 13] },
                    { name: "Hair Cut", data: [25, 30, 28, 32] }
                ],
                categories: ["Week 1", "Week 2", "Week 3", "Week 4"]
            },
            'Monthly': {
                series: [
                    { name: "Facial", data: [44, 55, 41, 67, 22, 43, 44, 55, 41, 67, 22, 43] },
                    { name: "Manicure", data: [13, 23, 20, 8, 13, 27, 13, 23, 20, 8, 13, 27] },
                    { name: "Pedicure", data: [11, 17, 15, 15, 21, 14, 11, 17, 15, 15, 21, 14] },
                    { name: "Hair Cut", data: [21, 7, 25, 13, 22, 8, 21, 7, 25, 13, 22, 8] }
                ],
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            },
            'Yearly': {
                series: [
                    { name: "Facial", data: [500, 600, 700, 800, 900] },
                    { name: "Manicure", data: [200, 250, 300, 350, 400] },
                    { name: "Pedicure", data: [150, 170, 190, 210, 230] },
                    { name: "Hair Cut", data: [300, 350, 400, 450, 500] }
                ],
                categories: ["2021", "2022", "2023", "2024", "2025"]
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.revenueByServicesService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.revenueByServicesService.updateChart(selectedData.series, selectedData.categories);
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