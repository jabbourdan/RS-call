import { Component, HostListener } from '@angular/core';
import { MusicPlayerComponent } from './music-player/music-player.component';

@Component({
    selector: 'app-player',
    imports: [MusicPlayerComponent],
    templateUrl: './player.component.html',
    styleUrl: './player.component.scss'
})
export class PlayerComponent {

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