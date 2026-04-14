import { Component, HostListener } from '@angular/core';
import { TodaysPaymentService } from './todays-payment.service';

@Component({
    selector: 'app-todays-payment',
    imports: [],
    templateUrl: './todays-payment.component.html',
    styleUrl: './todays-payment.component.scss'
})
export class TodaysPaymentComponent {

    selectedTimeframe: string = 'Monthly'; // Default dropdown text
    chartData: { [key: string]: { series: any[]; categories: string[] } };

    constructor(
        private todaysPaymentService: TodaysPaymentService
    ) {
        this.chartData = {
            Weekly: {
                series: [{ name: 'Payment', data: [10, 20, 15, 25, 30, 35, 40] }],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            Monthly: {
                series: [{ name: 'Payment', data: [40, 50, 80, 50, 40, 30, 40, 50, 60, 70, 50, 65] }],
                categories: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec'
                ]
            },
            Yearly: {
                series: [{ name: 'Payment', data: [500, 550, 600, 650, 700] }],
                categories: ['2021', '2022', '2023', '2024', '2025']
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.todaysPaymentService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.todaysPaymentService.updateChart(selectedData.series, selectedData.categories);
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