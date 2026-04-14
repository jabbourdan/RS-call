import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-history-of-bids:not(0)',
    imports: [],
    templateUrl: './history-of-bids.component.html',
    styleUrl: './history-of-bids.component.scss'
})
export class HistoryOfBidsComponent {
    
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