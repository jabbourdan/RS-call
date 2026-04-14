import { Component } from '@angular/core';
import { InstagramCampaignsService } from './instagram-campaigns.service';

@Component({
    selector: 'app-instagram-campaigns',
    imports: [],
    templateUrl: './instagram-campaigns.component.html',
    styleUrl: './instagram-campaigns.component.scss'
})
export class InstagramCampaignsComponent {

    constructor(
        private instagramCampaignsService: InstagramCampaignsService
    ) {}

    ngOnInit(): void {
        this.instagramCampaignsService.loadChart();
    }

    ngOnDestroy(): void {
        this.instagramCampaignsService.stopLiveUpdates();
    }

}