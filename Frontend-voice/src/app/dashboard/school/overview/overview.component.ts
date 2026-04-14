import { Component } from '@angular/core';

@Component({
    selector: 'app-overview',
    imports: [],
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.scss'
})
export class OverviewComponent {

    formattedDate: string;

    constructor() {
        this.formattedDate = this.formatDate();
    }

    formatDate(): string {
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        return today.toLocaleDateString('en-US', options); // Format: "December 10, 2025"
    }

}