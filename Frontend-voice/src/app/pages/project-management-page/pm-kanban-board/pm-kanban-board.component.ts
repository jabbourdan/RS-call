import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-pm-kanban-board',
    imports: [RouterLink],
    templateUrl: './pm-kanban-board.component.html',
    styleUrl: './pm-kanban-board.component.scss'
})
export class PmKanbanBoardComponent {

    // Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

}