import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ReviewsComponent } from './reviews/reviews.component';

@Component({
    selector: 'app-reap-property-details',
    imports: [RouterLink, CarouselModule, ReviewsComponent],
    templateUrl: './reap-property-details.component.html',
    styleUrl: './reap-property-details.component.scss'
})
export class ReapPropertyDetailsComponent {
    
    // Product Images
    propertyImages = [
        {
            url: 'images/properties/property-details1.jpg'
        },
        {
            url: 'images/properties/property-details2.jpg'
        },
        {
            url: 'images/properties/property-details3.jpg'
        },
        {
            url: 'images/properties/property-details4.jpg'
        }
    ]
    selectedImage: string = this.propertyImages[0].url;
    changeImage(image: string) {
        this.selectedImage = image;
    }

}