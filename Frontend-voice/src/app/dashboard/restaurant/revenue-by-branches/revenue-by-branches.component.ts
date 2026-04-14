import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-revenue-by-branches',
    imports: [],
    templateUrl: './revenue-by-branches.component.html',
    styleUrl: './revenue-by-branches.component.scss'
})
export class RevenueByBranchesComponent {

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