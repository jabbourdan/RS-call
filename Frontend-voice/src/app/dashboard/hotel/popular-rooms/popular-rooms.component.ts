import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
    selector: 'app-popular-rooms',
    imports: [CarouselModule, RouterLink],
    templateUrl: './popular-rooms.component.html',
    styleUrl: './popular-rooms.component.scss'
})
export class PopularRoomsComponent {

    // Owl Carousel
    popularRoomsSlides: OwlOptions = {
        nav: false,
        loop: true,
        dots: true,
        margin: 25,
        autoplay: false,
        smartSpeed: 500,
        autoplayHoverPause: true,
        navText: [
            "<i class='ri-arrow-left-line'></i>",
            "<i class='ri-arrow-right-line'></i>"
        ],
        responsive: {
            0: {
                items: 1
            },
            506: {
                items: 2
            },
            668: {
                items: 3
            },
            705: {
                items: 4
            }
        }
    }

}