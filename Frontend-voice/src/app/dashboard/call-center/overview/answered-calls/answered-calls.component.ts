import { Component } from '@angular/core';
import { AnsweredCallsService } from './answered-calls.service';

@Component({
    selector: 'app-answered-calls',
    imports: [],
    templateUrl: './answered-calls.component.html',
    styleUrl: './answered-calls.component.scss'
})
export class AnsweredCallsComponent {

    constructor(
        private answeredCallsService: AnsweredCallsService
    ) {}

    ngOnInit(): void {
        this.answeredCallsService.loadChart();
    }

}