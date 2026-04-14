import { Component } from '@angular/core';
import { NewBookingsComponent } from './new-bookings/new-bookings.component';
import { CheckInComponent } from './check-in/check-in.component';
import { CheckOutComponent } from './check-out/check-out.component';

@Component({
    selector: 'app-stats',
    imports: [NewBookingsComponent, CheckInComponent, CheckOutComponent],
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.scss'
})
export class StatsComponent {}