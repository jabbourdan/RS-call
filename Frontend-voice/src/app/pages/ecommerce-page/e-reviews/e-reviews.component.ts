import { RouterLink } from '@angular/router';
import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-e-reviews',
    imports: [RouterLink],
    templateUrl: './e-reviews.component.html',
    styleUrl: './e-reviews.component.scss'
})
export class EReviewsComponent {

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