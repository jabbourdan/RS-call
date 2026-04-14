import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-nm-explore-all',
    imports: [RouterLink, FormsModule],
    templateUrl: './nm-explore-all.component.html',
    styleUrl: './nm-explore-all.component.scss'
})
export class NmExploreAllComponent {

    // Range Slider
    minValue: number = 1; // Minimum value for range and number inputs
    maxValue: number = 50; // Maximum value for range and number inputs
    stepValue: number = 1; // Step for range inputs
    rangeValues: number[] = [18, 50]; // Initial values for the range inputs
    // Called when a range input is moved
    onRangeInput(): void {
        let [slide1, slide2] = this.rangeValues;
        if (slide1 > slide2) {
            [slide1, slide2] = [slide2, slide1];
        }
        this.rangeValues = [slide1, slide2];
    }
    // Called when a number input is changed
    onNumberInput(): void {
        let [num1, num2] = this.rangeValues;
        if (num1 > num2) {
            [num1, num2] = [num2, num1];
        }
        this.rangeValues = [num1, num2];
    }

}