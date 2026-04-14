import { Component, HostListener } from '@angular/core';
import { NewSoldPropertiesService } from './new-sold-properties.service';

@Component({
    selector: 'app-new-sold-properties',
    imports: [],
    templateUrl: './new-sold-properties.component.html',
    styleUrl: './new-sold-properties.component.scss'
})
export class NewSoldPropertiesComponent {

    constructor(
        private newSoldPropertiesService: NewSoldPropertiesService
    ) {}

    selectedTimeframe: string = 'Monthly'; // Default selected text
    categories: string[] = [];
    series: any[] = [];

    ngOnInit(): void {
        this.updateChartData('Monthly'); // Default chart load
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        this.updateChartData(timeframe);
    }

    private updateChartData(timeframe: string): void {
        switch (timeframe) {
            case 'Weekly':
                this.series = [
                    { name: "New Property", data: [10, 15, 20, 25, 30, 35, 40] },
                    { name: "Sold Property", data: [5, 10, 15, 12, 18, 22, 28] }
                ];
                this.categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                break;

            case 'Monthly':
                this.series = [
                    { name: "New Property", data: [85, 55, 70, 98, 65, 38, 63, 45, 85, 55, 45, 48] },
                    { name: "Sold Property", data: [35, 42, 60, 38, 16, 20, 25, 38, 37, 50, 35, 38] }
                ];
                this.categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                break;

            case 'Yearly':
                this.series = [
                    { name: "New Property", data: [450, 480, 500, 520, 540] },
                    { name: "Sold Property", data: [300, 350, 400, 420, 480] }
                ];
                this.categories = ['2021', '2022', '2023', '2024', '2025'];
                break;
        }
        // Call the service to load the chart with updated data
        this.newSoldPropertiesService.loadChart(this.series, this.categories);
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