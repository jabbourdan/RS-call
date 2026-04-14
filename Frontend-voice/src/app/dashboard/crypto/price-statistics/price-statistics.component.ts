import { Component, HostListener } from '@angular/core';
import { PriceStatisticsService } from './price-statistics.service';

@Component({
    selector: 'app-price-statistics',
    imports: [],
    templateUrl: './price-statistics.component.html',
    styleUrl: './price-statistics.component.scss'
})
export class PriceStatisticsComponent {

    constructor(
        private priceStatisticsService: PriceStatisticsService
    ) {}

    ngOnInit(): void {
        this.priceStatisticsService.loadChart();
    }

    // Card Header Menu
    isCardHeaderOpen = false;
    isCardHeaderOpen2 = false;
    toggleCardHeaderMenu() {
        this.isCardHeaderOpen = !this.isCardHeaderOpen;
    }
    toggleCardHeaderMenu2() {
        this.isCardHeaderOpen2 = !this.isCardHeaderOpen2;
    }
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.trezo-card-dropdown')) {
            this.isCardHeaderOpen = false;
        }
        if (!target.closest('.trezo-card-dropdown2')) {
            this.isCardHeaderOpen2 = false;
        }
    }

}