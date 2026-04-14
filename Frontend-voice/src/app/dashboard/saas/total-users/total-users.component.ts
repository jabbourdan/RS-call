import { Component } from '@angular/core';
import { TotalUsersService } from './total-users.service';

@Component({
    selector: 'app-total-users',
    imports: [],
    templateUrl: './total-users.component.html',
    styleUrl: './total-users.component.scss'
})
export class TotalUsersComponent {

    constructor(
        private totalUsersService: TotalUsersService
    ) {}

    ngOnInit(): void {
        this.totalUsersService.loadChart();
    }

}