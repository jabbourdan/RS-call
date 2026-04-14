import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ReviewsComponent } from './reviews/reviews.component';

@Component({
    selector: 'app-r-dish-details',
    imports: [RouterLink, ReviewsComponent, CarouselModule],
    templateUrl: './r-dish-details.component.html',
    styleUrl: './r-dish-details.component.scss'
})
export class RDishDetailsComponent {

    // Product Images
    productImages = [
        {
            url: 'images/restaurant/dish-details1.jpg'
        },
        {
            url: 'images/restaurant/dish-details2.jpg'
        },
        {
            url: 'images/restaurant/dish-details3.jpg'
        },
        {
            url: 'images/restaurant/dish-details4.jpg'
        }
    ]
    selectedImage: string = this.productImages[0].url;
    changeImage(image: string) {
        this.selectedImage = image;
    }

}