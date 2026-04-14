import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-most-sales-location',
    imports: [],
    templateUrl: './most-sales-location.component.html',
    styleUrl: './most-sales-location.component.scss'
})
export class MostSalesLocationComponent {

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