import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-users-by-country',
    imports: [],
    templateUrl: './users-by-country.component.html',
    styleUrl: './users-by-country.component.scss'
})
export class UsersByCountryComponent {

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