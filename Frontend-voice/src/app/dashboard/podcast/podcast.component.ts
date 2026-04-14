import { Component } from '@angular/core';
import { FeaturedComponent } from './featured/featured.component';
import { PopularHostsComponent } from './popular-hosts/popular-hosts.component';
import { RecentlyPlayedComponent } from './recently-played/recently-played.component';
import { PlayerComponent } from './player/player.component';
import { MostPopularComponent } from './most-popular/most-popular.component';
import { UpcomingEpisodesComponent } from './upcoming-episodes/upcoming-episodes.component';
import { TodaysEarningsComponent } from './todays-earnings/todays-earnings.component';
import { ListenerAnalyticsComponent } from './listener-analytics/listener-analytics.component';
import { TopPodcastersComponent } from './top-podcasters/top-podcasters.component';

@Component({
    selector: 'app-podcast',
    imports: [FeaturedComponent, PopularHostsComponent, RecentlyPlayedComponent, PlayerComponent, MostPopularComponent, UpcomingEpisodesComponent, TodaysEarningsComponent, ListenerAnalyticsComponent, TopPodcastersComponent],
    templateUrl: './podcast.component.html',
    styleUrl: './podcast.component.scss'
})
export class PodcastComponent {}