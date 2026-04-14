import { Component, HostListener } from '@angular/core';
import { FollowersByGenderService } from './followers-by-gender.service';

@Component({
    selector: 'app-followers-by-gender',
    imports: [],
    templateUrl: './followers-by-gender.component.html',
    styleUrl: './followers-by-gender.component.scss'
})
export class FollowersByGenderComponent {

    selectedTimeframe: string = 'This Week'; // Default selection
    chartData: { [key: string]: number[] };

    constructor(
        private followersByGenderService: FollowersByGenderService
    ) {
        this.chartData = {
            'This Day': [60, 40],
            'This Week': [55, 45],
            'This Month': [50, 50],
            'This Year': [52, 48]
        };
    }

    async ngOnInit(): Promise<void> {
        await this.followersByGenderService.loadChart(this.chartData[this.selectedTimeframe]);
    }

    async onTimeframeChange(timeframe: string): Promise<void> {
        this.selectedTimeframe = timeframe;
        await this.followersByGenderService.updateChart(this.chartData[timeframe]);
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