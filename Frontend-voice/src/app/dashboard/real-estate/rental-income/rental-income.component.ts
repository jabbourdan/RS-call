import { Component, HostListener } from '@angular/core';
import { RentalIncomeService } from './rental-income.service';

@Component({
    selector: 'app-rental-income',
    imports: [],
    templateUrl: './rental-income.component.html',
    styleUrl: './rental-income.component.scss'
})
export class RentalIncomeComponent {

    selectedTimeframe: string = 'This Year'; // Default timeframe
    chartData: {
        [key: string]: {
            series: number[],
            categories: string[]
        };
    };

    constructor(
        private rentalIncomeService: RentalIncomeService
    ) {
        // Define the data for each timeframe
        this.chartData = {
            'This Day': {
                series: [50, 60, 30, 40, 20, 30, 25, 15, 10, 35, 20, 25],
                categories: ['12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM']
            },
            'This Week': {
                series: [230, 400, 180, 360, 750, 300, 230],
                categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            },
            'This Month': {
                series: [450, 500, 550, 400],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'This Year': {
                series: [430, 500, 400, 650, 230, 400, 180, 360, 750, 300, 230, 170],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.rentalIncomeService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update the selected timeframe
        const selectedData = this.chartData[timeframe];
        this.rentalIncomeService.updateChart(selectedData.series, selectedData.categories);
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