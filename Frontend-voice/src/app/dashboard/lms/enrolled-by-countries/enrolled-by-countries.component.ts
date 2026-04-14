import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-enrolled-by-countries',
    imports: [],
    templateUrl: './enrolled-by-countries.component.html',
    styleUrl: './enrolled-by-countries.component.scss'
})
export class EnrolledByCountriesComponent {

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