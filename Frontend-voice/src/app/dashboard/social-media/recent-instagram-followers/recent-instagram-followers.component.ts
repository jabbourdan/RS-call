import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-recent-instagram-followers',
    imports: [],
    templateUrl: './recent-instagram-followers.component.html',
    styleUrl: './recent-instagram-followers.component.scss'
})
export class RecentInstagramFollowersComponent {

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