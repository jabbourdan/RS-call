import { Component } from '@angular/core';
import { InstagramFollowersComponent } from './instagram-followers/instagram-followers.component';
import { LinkedinFollowersComponent } from './linkedin-followers/linkedin-followers.component';
import { TiktokFollowersComponent } from './tiktok-followers/tiktok-followers.component';
import { FacebookFollowersComponent } from './facebook-followers/facebook-followers.component';
import { XFollowersComponent } from './x-followers/x-followers.component';
import { YoutubeSubscribersComponent } from './youtube-subscribers/youtube-subscribers.component';
import { LinkedinNetFollowersComponent } from './linkedin-net-followers/linkedin-net-followers.component';
import { SuggestionsComponent } from './suggestions/suggestions.component';
import { FollowersByGenderComponent } from './followers-by-gender/followers-by-gender.component';
import { RecentInstagramFollowersComponent } from './recent-instagram-followers/recent-instagram-followers.component';
import { FacebookCampaignComponent } from './facebook-campaign/facebook-campaign.component';
import { UpgradePlanComponent } from './upgrade-plan/upgrade-plan.component';

@Component({
    selector: 'app-social-media',
    imports: [InstagramFollowersComponent, LinkedinFollowersComponent, TiktokFollowersComponent, FacebookFollowersComponent, XFollowersComponent, YoutubeSubscribersComponent, LinkedinNetFollowersComponent, SuggestionsComponent, FollowersByGenderComponent, RecentInstagramFollowersComponent, FacebookCampaignComponent, UpgradePlanComponent],
    templateUrl: './social-media.component.html',
    styleUrl: './social-media.component.scss'
})
export class SocialMediaComponent {}