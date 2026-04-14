import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-average-order-value',
    imports: [],
    templateUrl: './average-order-value.component.html',
    styleUrl: './average-order-value.component.scss'
})
export class AverageOrderValueComponent {

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