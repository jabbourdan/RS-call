import { Component } from '@angular/core';
import { TotalCallsService } from './total-calls.service';

@Component({
    selector: 'app-total-calls',
    imports: [],
    templateUrl: './total-calls.component.html',
    styleUrl: './total-calls.component.scss'
})
export class TotalCallsComponent {

    constructor(
        private totalCallsService: TotalCallsService
    ) {}

    ngOnInit(): void {
        this.totalCallsService.loadChart();
    }

}