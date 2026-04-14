import { Component, HostListener } from '@angular/core';
import { ActiveUsersService } from './active-users.service';

@Component({
    selector: 'app-active-users',
    imports: [],
    templateUrl: './active-users.component.html',
    styleUrl: './active-users.component.scss'
})
export class ActiveUsersComponent {

    selectedTimeframe: string = 'Monthly'; // Default dropdown text
    chartData: {
        [key: string]: {
            series: number[],
            categories: string[]
        };
    };

    constructor(
        private activeUsersService: ActiveUsersService
    ) {
        // Define the data for each timeframe
        this.chartData = {
            'Weekly': {
                series: [10, 15, 12, 18, 20, 22, 25],
                categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            },
            'Monthly': {
                series: [25, 18, 42, 83, 38, 65, 20, 42, 18, 25, 76, 40],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            'Yearly': {
                series: [230, 300, 450, 400, 380],
                categories: ['2021', '2022', '2023', '2024', '2025']
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.activeUsersService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.activeUsersService.updateChart(selectedData.series, selectedData.categories);
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