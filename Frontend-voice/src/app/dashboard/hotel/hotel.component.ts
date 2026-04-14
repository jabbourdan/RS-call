import { Component } from '@angular/core';
import { StatsComponent } from './stats/stats.component';
import { RecentBookingsComponent } from './recent-bookings/recent-bookings.component';
import { RoomsAvailabilityComponent } from './rooms-availability/rooms-availability.component';
import { GuestActivityComponent } from './guest-activity/guest-activity.component';
import { UpcomingVipReservationsComponent } from './upcoming-vip-reservations/upcoming-vip-reservations.component';
import { PopularRoomsComponent } from './popular-rooms/popular-rooms.component';
import { CustomerReviewsComponent } from './customer-reviews/customer-reviews.component';

@Component({
    selector: 'app-hotel',
    imports: [StatsComponent, RecentBookingsComponent, RoomsAvailabilityComponent, GuestActivityComponent, UpcomingVipReservationsComponent, PopularRoomsComponent, CustomerReviewsComponent],
    templateUrl: './hotel.component.html',
    styleUrl: './hotel.component.scss'
})
export class HotelComponent {}