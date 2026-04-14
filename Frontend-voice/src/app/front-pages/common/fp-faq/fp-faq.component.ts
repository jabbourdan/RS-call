import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-fp-faq',
    imports: [NgClass],
    templateUrl: './fp-faq.component.html',
    styleUrl: './fp-faq.component.scss'
})
export class FpFaqComponent {

    // Accordion
    openSectionIndex: number = 0;
    toggleSection(index: number): void {
        if (this.openSectionIndex === index) {
            this.openSectionIndex = -1;
        } else {
            this.openSectionIndex = index;
        }
    }
    isSectionOpen(index: number): boolean {
        return this.openSectionIndex === index;
    }

}