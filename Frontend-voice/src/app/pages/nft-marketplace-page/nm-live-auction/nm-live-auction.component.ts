import { Component } from '@angular/core';
import { MobileAppComponent } from './mobile-app/mobile-app.component';
import { HistoryOfBidsComponent } from './history-of-bids/history-of-bids.component';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-nm-live-auction',
    imports: [MobileAppComponent, HistoryOfBidsComponent, RouterLink],
    templateUrl: './nm-live-auction.component.html',
    styleUrl: './nm-live-auction.component.scss'
})
export class NmLiveAuctionComponent {}