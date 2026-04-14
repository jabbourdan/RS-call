import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-total-transactions',
    imports: [],
    templateUrl: './total-transactions.component.html',
    styleUrl: './total-transactions.component.scss'
})
export class TotalTransactionsComponent {

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