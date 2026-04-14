import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-timeline',
    imports: [],
    templateUrl: './timeline.component.html',
    styleUrl: './timeline.component.scss'
})
export class TimelineComponent {

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