import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-suggestions',
    imports: [],
    templateUrl: './suggestions.component.html',
    styleUrl: './suggestions.component.scss'
})
export class SuggestionsComponent {

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