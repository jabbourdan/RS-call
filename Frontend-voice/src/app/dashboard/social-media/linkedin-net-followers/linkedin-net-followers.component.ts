import { Component, HostListener } from '@angular/core';
import { LinkedinNetFollowersService } from './linkedin-net-followers.service';

@Component({
    selector: 'app-linkedin-net-followers',
    imports: [],
    templateUrl: './linkedin-net-followers.component.html',
    styleUrl: './linkedin-net-followers.component.scss'
})
export class LinkedinNetFollowersComponent {

    selectedTimeframe: string = 'Last Week'; // Default timeframe
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private linkedinNetFollowersService: LinkedinNetFollowersService
    ) {
        this.chartData = {
            'Last Day': {
                series: [{ name: 'Followers', data: [150] }],
                categories: ['Today']
            },
            'Last Week': {
                series: [{ name: 'Followers', data: [250, 150, 250, 120, 350, 150, 250] }],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            'Last Month': {
                series: [{ name: 'Followers', data: [300, 250, 270, 200, 320, 280, 310, 290, 330, 340, 350, 300, 320, 310, 300, 310, 330, 320, 340, 350, 330, 320, 340, 360, 370, 390, 380, 400, 410, 420] }],
                categories: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
            },
            'Last Year': {
                series: [{ name: 'Followers', data: [3000, 2800, 2900, 3200, 3100, 3300, 3400, 3500, 3200, 3100, 3000, 3200] }],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.linkedinNetFollowersService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update dropdown text
        const selectedData = this.chartData[timeframe];
        this.linkedinNetFollowersService.updateChart(selectedData.series, selectedData.categories);
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