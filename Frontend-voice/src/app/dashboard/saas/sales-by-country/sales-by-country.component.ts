import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-sales-by-country',
    imports: [],
    templateUrl: './sales-by-country.component.html',
    styleUrl: './sales-by-country.component.scss'
})
export class SalesByCountryComponent {

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