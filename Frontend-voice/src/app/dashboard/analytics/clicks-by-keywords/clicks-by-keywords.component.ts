import { RouterLink } from '@angular/router';
import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-clicks-by-keywords',
    imports: [RouterLink],
    templateUrl: './clicks-by-keywords.component.html',
    styleUrl: './clicks-by-keywords.component.scss'
})
export class ClicksByKeywordsComponent {

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