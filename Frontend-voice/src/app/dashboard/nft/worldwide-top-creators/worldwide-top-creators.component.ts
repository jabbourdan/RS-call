import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-worldwide-top-creators',
    imports: [],
    templateUrl: './worldwide-top-creators.component.html',
    styleUrl: './worldwide-top-creators.component.scss'
})
export class WorldwideTopCreatorsComponent {
    
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