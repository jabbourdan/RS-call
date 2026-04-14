import { Component, HostListener } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
    selector: 'app-customer-reviews',
    imports: [CarouselModule],
    templateUrl: './customer-reviews.component.html',
    styleUrl: './customer-reviews.component.scss'
})
export class CustomerReviewsComponent {
    
    // Owl Carousel
    customerReviewsSlides: OwlOptions = {
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
        ],
        responsive: {
			0: {
				items: 1
			},
			505: {
				items: 1
			},
			665: {
				items: 2
			},
			890: {
				items: 2
			},
			1115: {
                items: 2
			}
		}
    }
    
    // Card Header Menu
    isCardHeaderOpen = false;
    toggleCardHeaderMenu() {
        this.isCardHeaderOpen = !this.isCardHeaderOpen;
    }
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.trezo-card-dropdown')) {
            this.isCardHeaderOpen = false;
        }
    }

}