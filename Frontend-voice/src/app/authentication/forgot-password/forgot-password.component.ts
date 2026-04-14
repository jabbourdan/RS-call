import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToggleService } from '../../common/header/toggle.service';

@Component({
    selector: 'app-forgot-password',
    imports: [RouterLink],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

    constructor(
        public toggleService: ToggleService
    ) {}

    ngOnInit(): void {
        // Initialize theme and direction on component load
        this.toggleService.initializeTheme();
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