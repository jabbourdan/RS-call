import { Component } from '@angular/core';
import { SessionsService } from './sessions.service';

@Component({
    selector: 'app-sessions',
    imports: [],
    templateUrl: './sessions.component.html',
    styleUrl: './sessions.component.scss'
})
export class SessionsComponent {

    constructor(
        private sessionsService: SessionsService
    ) {}

    ngOnInit(): void {
        this.sessionsService.loadChart();
    }

}