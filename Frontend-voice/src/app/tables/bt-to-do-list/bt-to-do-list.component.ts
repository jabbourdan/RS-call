import { Component } from '@angular/core';

@Component({
    selector: 'app-bt-to-do-list',
    imports: [],
    templateUrl: './bt-to-do-list.component.html',
    styleUrl: './bt-to-do-list.component.scss'
})
export class BtToDoListComponent {

    // Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

}