import { Component } from '@angular/core';

@Component({
    selector: 'app-my-cards',
    imports: [],
    templateUrl: './my-cards.component.html',
    styleUrl: './my-cards.component.scss'
})
export class MyCardsComponent {

    // Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

}