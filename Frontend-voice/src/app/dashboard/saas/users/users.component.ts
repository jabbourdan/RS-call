import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-users',
    imports: [],
    templateUrl: './users.component.html',
    styleUrl: './users.component.scss'
})
export class UsersComponent {

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