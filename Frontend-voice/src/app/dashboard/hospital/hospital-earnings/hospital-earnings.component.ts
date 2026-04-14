import { Component, HostListener } from '@angular/core';
import { TotalEarningsService } from './total-earnings.service';

@Component({
    selector: 'app-hospital-earnings',
    imports: [],
    templateUrl: './hospital-earnings.component.html',
    styleUrl: './hospital-earnings.component.scss'
})
export class HospitalEarningsComponent {

    constructor(
        private totalEarningsService: TotalEarningsService
    ) {}

    ngOnInit(): void {
        this.totalEarningsService.loadChart();
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