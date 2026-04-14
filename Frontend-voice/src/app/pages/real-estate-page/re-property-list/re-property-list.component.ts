import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-re-property-list',
    imports: [RouterLink],
    templateUrl: './re-property-list.component.html',
    styleUrl: './re-property-list.component.scss'
})
export class RePropertyListComponent {

    // Card Header Menu
    activeDropdown: string | null = null; // Tracks the currently active dropdown
    toggleDropdown(dropdownKey: string) {
        this.activeDropdown = this.activeDropdown === dropdownKey ? null : dropdownKey;
    }
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.trezo-card-dropdown')) {
            this.activeDropdown = null; // Close any open dropdown
        }
    }

}