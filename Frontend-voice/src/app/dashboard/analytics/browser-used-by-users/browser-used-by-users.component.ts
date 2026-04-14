import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-browser-used-by-users',
    imports: [],
    templateUrl: './browser-used-by-users.component.html',
    styleUrl: './browser-used-by-users.component.scss'
})
export class BrowserUsedByUsersComponent {

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