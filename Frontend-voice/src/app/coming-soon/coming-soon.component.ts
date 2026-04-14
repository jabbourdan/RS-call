import { Component, NgZone } from '@angular/core';
import { ToggleService } from '../common/header/toggle.service';

@Component({
    selector: 'app-coming-soon',
    imports: [],
    templateUrl: './coming-soon.component.html',
    styleUrl: './coming-soon.component.scss'
})
export class ComingSoonComponent {

    public countdownInterval: any;
    public countdown: { days: number, hours: number, minutes: number, seconds: number };

    constructor(
        public toggleService: ToggleService,
        private ngZone: NgZone
    ) {
        this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    ngOnInit(): void {
        // Initialize theme and direction on component load
        this.toggleService.initializeTheme();
        
        // Set your target date and time for the countdown
        const targetDate = new Date('2025-12-31T23:59:59').getTime();

        // Update the countdown every second
        this.ngZone.runOutsideAngular(() => {
            this.countdownInterval = setInterval(() => {
                const now = new Date().getTime();
                const timeDifference = targetDate - now;

                if (timeDifference > 0) {
                this.ngZone.run(() => {
                    this.countdown.days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
                    this.countdown.hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    this.countdown.minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
                    this.countdown.seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
                });
                } else {
                    // Countdown has ended, do something here
                    this.ngZone.run(() => {
                        this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
                    });
                    clearInterval(this.countdownInterval);
                }
            }, 1000);
        });
    }

    ngOnDestroy(): void {
        // Clear the interval to prevent memory leaks
        clearInterval(this.countdownInterval);
    }

    // Toggle theme between light and dark
    toggleTheme() {
        this.toggleService.toggleTheme();
    }

    // Toggle direction between LTR and RTL
    toggleDirection() {
        this.toggleService.toggleDirection();
    }

}