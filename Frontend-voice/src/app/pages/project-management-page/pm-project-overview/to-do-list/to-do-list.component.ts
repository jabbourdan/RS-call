import { Component } from '@angular/core';

@Component({
    selector: 'app-to-do-list:not(2)',
    imports: [],
    templateUrl: './to-do-list.component.html',
    styleUrl: './to-do-list.component.scss'
})
export class ToDoListComponent {

    // Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

}