import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-profile',
    imports: [RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent {

    // Dropdown Menu
    isCardHeaderOpen = false;
    isCardHeaderOpen2 = false;
    isCardHeaderOpen3 = false;
    toggleCardHeaderMenu() {
        this.isCardHeaderOpen = !this.isCardHeaderOpen;
    }
    toggleCardHeaderMenu2() {
        this.isCardHeaderOpen2 = !this.isCardHeaderOpen2;
    }
    toggleCardHeaderMenu3() {
        this.isCardHeaderOpen3 = !this.isCardHeaderOpen3;
    }
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.trezo-card-dropdown')) {
            this.isCardHeaderOpen = false;
        }
        if (!target.closest('.trezo-card-dropdown2')) {
            this.isCardHeaderOpen2 = false;
        }
        if (!target.closest('.trezo-card-dropdown3')) {
            this.isCardHeaderOpen3 = false;
        }
    }

}