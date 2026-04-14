import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-exchange',
    imports: [],
    templateUrl: './exchange.component.html',
    styleUrl: './exchange.component.scss'
})
export class ExchangeComponent {

    // Card Header Menu
    isCardHeaderOpen = false;
    isCardHeaderOpen2 = false;
    toggleCardHeaderMenu() {
        this.isCardHeaderOpen = !this.isCardHeaderOpen;
    }
    toggleCardHeaderMenu2() {
        this.isCardHeaderOpen2 = !this.isCardHeaderOpen2;
    }
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.cryptocurrency-types1')) {
            this.isCardHeaderOpen = false;
        }
        if (!target.closest('.cryptocurrency-types2')) {
            this.isCardHeaderOpen2 = false;
        }
    }

}