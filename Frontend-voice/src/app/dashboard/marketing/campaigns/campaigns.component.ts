import { NgClass } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from '@iplab/ngx-file-upload';

@Component({
    selector: 'app-campaigns',
    imports: [NgClass, FileUploadModule, FormsModule],
    templateUrl: './campaigns.component.html',
    styleUrl: './campaigns.component.scss'
})
export class CampaignsComponent {

    // Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }
    classApplied2 = false;
    toggleClass2() {
        this.classApplied2 = !this.classApplied2;
    }

    // Tabs
    currentTab = 'tab1';
    switchTab(event: MouseEvent, tab: string) {
        event.preventDefault();
        this.currentTab = tab;
    }
    currentTab2 = 'campaignTab1';
    switchTab2(event: MouseEvent, tab: string) {
        event.preventDefault();
        this.currentTab2 = tab;
    }

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
            
    // Card Header Menu
    isCardHeaderOpen = false;
    isCardHeaderOpen2 = false;
    isCardHeaderOpen3 = false;
    isCardHeaderOpen4 = false;
    toggleCardHeaderMenu() {
        this.isCardHeaderOpen = !this.isCardHeaderOpen;
    }
    toggleCardHeaderMenu2() {
        this.isCardHeaderOpen2 = !this.isCardHeaderOpen2;
    }
    toggleCardHeaderMenu3() {
        this.isCardHeaderOpen3 = !this.isCardHeaderOpen3;
    }
    toggleCardHeaderMenu4() {
        this.isCardHeaderOpen4 = !this.isCardHeaderOpen4;
    }
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.trezo-card-dropdown')) {
            this.isCardHeaderOpen = false;
            this.isCardHeaderOpen2 = false;
            this.isCardHeaderOpen3 = false;
            this.isCardHeaderOpen4 = false;
        }
    }

}