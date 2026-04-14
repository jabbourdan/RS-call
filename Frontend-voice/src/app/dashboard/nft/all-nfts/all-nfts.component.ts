import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
    selector: 'app-all-nfts',
    imports: [RouterLink, CarouselModule],
    templateUrl: './all-nfts.component.html',
    styleUrl: './all-nfts.component.scss'
})
export class AllNftsComponent {

	// Owl Carousel
    allNftsSlides: OwlOptions = {
		nav: true,
		margin: 15,
		loop: true,
		dots: false,
		autoplay: true,
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
			505: {
				items: 2
			},
			650: {
				items: 3
			},
			875: {
				items: 3
			},
			1015: {
				items: 4
			}
		}
    }

}