import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-total-discount',
    imports: [],
    templateUrl: './total-discount.component.html',
    styleUrl: './total-discount.component.scss'
})
export class TotalDiscountComponent {

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