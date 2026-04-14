import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';

@Component({
    selector: 'app-nm-nft-details',
    imports: [RouterLink, CarouselModule, NgClass],
    templateUrl: './nm-nft-details.component.html',
    styleUrl: './nm-nft-details.component.scss'
})
export class NmNftDetailsComponent {

    // Product Images
    productImages = [
        {
            url: 'images/nfts/nft-details1.jpg'
        },
        {
            url: 'images/nfts/nft-details2.jpg'
        },
        {
            url: 'images/nfts/nft-details3.jpg'
        },
        {
            url: 'images/nfts/nft-details4.jpg'
        }
    ]
    selectedImage: string = this.productImages[0].url;
    changeImage(image: string) {
        this.selectedImage = image;
    }

    // Tabs
    currentTab = 'tab1';
    switchTab(event: MouseEvent, tab: string) {
        event.preventDefault();
        this.currentTab = tab;
    }

}