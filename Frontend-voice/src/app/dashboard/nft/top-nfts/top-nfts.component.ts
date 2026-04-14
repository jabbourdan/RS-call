import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-top-nfts',
    imports: [],
    templateUrl: './top-nfts.component.html',
    styleUrl: './top-nfts.component.scss'
})
export class TopNftsComponent {
    
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