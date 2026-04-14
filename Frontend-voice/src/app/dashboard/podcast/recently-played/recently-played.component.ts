import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-recently-played',
    imports: [RouterLink],
    templateUrl: './recently-played.component.html',
    styleUrl: './recently-played.component.scss'
})
export class RecentlyPlayedComponent {

    // Use a map to store the open/close state for each dropdown
    openMenus: { [key: string]: boolean } = {};
    menuBtn(menuId: string): void {
        this.openMenus[menuId] = !this.openMenus[menuId];
    }
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        const openMenusKeys = Object.keys(this.openMenus);
        // Close any open menu when clicked outside
        openMenusKeys.forEach((menuId) => {
            if (!target.closest(`#${menuId}`)) {
                this.openMenus[menuId] = false;
            }
        });
    }

}