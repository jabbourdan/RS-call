import { RouterLink } from '@angular/router';
import { Component, HostListener } from '@angular/core';
import { FileUploadModule } from '@iplab/ngx-file-upload';

@Component({
    selector: 'app-ct-gainers-losers',
    imports: [RouterLink, FileUploadModule],
    templateUrl: './ct-gainers-losers.component.html',
    styleUrl: './ct-gainers-losers.component.scss'
})
export class CtGainersLosersComponent {

    // Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }
    
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