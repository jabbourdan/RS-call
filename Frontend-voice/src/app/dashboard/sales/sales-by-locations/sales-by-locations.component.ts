import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-sales-by-locations',
    imports: [],
    templateUrl: './sales-by-locations.component.html',
    styleUrl: './sales-by-locations.component.scss'
})
export class SalesByLocationsComponent {

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