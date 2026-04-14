import { Component } from '@angular/core';
import { AllNftsComponent } from './all-nfts/all-nfts.component';
import { EthereumRateComponent } from './ethereum-rate/ethereum-rate.component';
import { ActiveAuctionsComponent } from './active-auctions/active-auctions.component';
import { FeaturedNFTArtworksComponent } from './featured-nft-artworks/featured-nft-artworks.component';
import { MobileAppComponent } from './mobile-app/mobile-app.component';
import { MostPopularSellersComponent } from './most-popular-sellers/most-popular-sellers.component';
import { WorldwideTopCreatorsComponent } from './worldwide-top-creators/worldwide-top-creators.component';
import { TopCollectionsComponent } from './top-collections/top-collections.component';
import { TopNftsComponent } from './top-nfts/top-nfts.component';
import { HistoryOfBidsComponent } from './history-of-bids/history-of-bids.component';

@Component({
    selector: 'app-nft',
    imports: [AllNftsComponent, EthereumRateComponent, ActiveAuctionsComponent, FeaturedNFTArtworksComponent, MobileAppComponent, MostPopularSellersComponent, WorldwideTopCreatorsComponent, TopCollectionsComponent, TopNftsComponent, HistoryOfBidsComponent],
    templateUrl: './nft.component.html',
    styleUrl: './nft.component.scss'
})
export class NftComponent {}