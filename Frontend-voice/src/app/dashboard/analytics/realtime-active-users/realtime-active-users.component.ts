import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RealtimeActiveUsersService } from './realtime-active-users.service';

@Component({
    selector: 'app-realtime-active-users',
    imports: [RouterLink],
    templateUrl: './realtime-active-users.component.html',
    styleUrl: './realtime-active-users.component.scss'
})
export class RealtimeActiveUsersComponent {

    constructor(
        private realtimeActiveUsersService: RealtimeActiveUsersService
    ) {}

    ngOnInit(): void {
        this.realtimeActiveUsersService.loadChart();
    }

}