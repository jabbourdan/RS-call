import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToggleService } from '../../common/header/toggle.service';
import { AuthService } from '../../services/auth/auth.service';
import { CurrentUser } from '../../services/auth/auth.models';

@Component({
    selector: 'app-logout',
    imports: [RouterLink],
    templateUrl: './logout.component.html',
    styleUrl: './logout.component.scss'
})
export class LogoutComponent implements OnInit {

    currentUser: CurrentUser | null = null;
    isLoggingOut: boolean = false;

    constructor(
        public toggleService: ToggleService,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.toggleService.initializeTheme();
        this.currentUser = this.authService.currentUser();
        // Auto sign-out as soon as this page loads
        this.performSignOut();
    }

    performSignOut(): void {
        this.isLoggingOut = true;
        this.authService.signOut().subscribe({
            next: () => {
                this.isLoggingOut = false;
            },
            error: () => {
                // clearSession() already called in service even on error
                this.isLoggingOut = false;
            }
        });
    }

    toggleTheme(): void {
        this.toggleService.toggleTheme();
    }
}