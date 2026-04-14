import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-geography',
    imports: [],
    templateUrl: './geography.component.html',
    styleUrl: './geography.component.scss'
})
export class GeographyComponent {

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