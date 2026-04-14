import { Component } from '@angular/core';
import { MissedCallsService } from './missed-calls.service';

@Component({
    selector: 'app-missed-calls',
    imports: [],
    templateUrl: './missed-calls.component.html',
    styleUrl: './missed-calls.component.scss'
})
export class MissedCallsComponent {

    constructor(
        private missedCallsService: MissedCallsService
    ) {}

    ngOnInit(): void {
        this.missedCallsService.loadChart();
    }

}