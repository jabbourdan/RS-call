import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-nm-creator-details',
    imports: [RouterLink, NgClass],
    templateUrl: './nm-creator-details.component.html',
    styleUrl: './nm-creator-details.component.scss'
})
export class NmCreatorDetailsComponent {

    // Tabs
    currentTab = 'tab1';
    switchTab(event: MouseEvent, tab: string) {
        event.preventDefault();
        this.currentTab = tab;
    }

}