import { RouterLink } from '@angular/router';
import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-my-recent-patients',
    imports: [RouterLink],
    templateUrl: './my-recent-patients.component.html',
    styleUrl: './my-recent-patients.component.scss'
})
export class MyRecentPatientsComponent {

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