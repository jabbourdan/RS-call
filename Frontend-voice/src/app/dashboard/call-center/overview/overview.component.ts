import { Component, HostListener } from '@angular/core';
import { TotalCallsComponent } from './total-calls/total-calls.component';
import { AnsweredCallsComponent } from './answered-calls/answered-calls.component';
import { MissedCallsComponent } from './missed-calls/missed-calls.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-overview',
    imports: [NgClass, TotalCallsComponent, AnsweredCallsComponent, MissedCallsComponent],
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.scss'
})
export class OverviewComponent {

    // Tabs
    currentTab = 'tab1';
    switchTab(event: MouseEvent, tab: string) {
        event.preventDefault();
        this.currentTab = tab;
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