import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-pm-users',
    imports: [RouterLink],
    templateUrl: './pm-users.component.html',
    styleUrl: './pm-users.component.scss'
})
export class PmUsersComponent {

    // Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

}