import { Component } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { MusicPlayerComponent } from './music-player/music-player.component';

@Component({
    selector: 'app-featured',
    imports: [CarouselModule, MusicPlayerComponent],
    templateUrl: './featured.component.html',
    styleUrl: './featured.component.scss'
})
export class FeaturedComponent {

    // Owl Carousel
    featuredSlides: OwlOptions = {
        items: 1,
        nav: false,
        loop: true,
        margin: 25,
        dots: true,
        autoplay: false,
        smartSpeed: 500,
        autoplayHoverPause: true,
        navText: [
            "<i class='ri-arrow-left-line'></i>",
            "<i class='ri-arrow-right-line'></i>"
        ]
    }

}