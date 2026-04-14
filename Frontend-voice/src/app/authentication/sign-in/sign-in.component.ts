import { Component, OnInit, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToggleService } from '../../common/header/toggle.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
    selector: 'app-sign-in',
    imports: [RouterLink, NgClass, TranslateModule, FormsModule],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {

    // ─── Language ──────────────────────────────────────────────────────────────
    currentLang: string = 'en';
    isLangMenuOpen: boolean = false;

    languages = [
        { code: 'en', label: 'English',  flag: 'images/flags/usa.svg' },
        { code: 'ar', label: 'العربية',  flag: 'images/flags/saudi-arabia.svg' },
        { code: 'he', label: 'עברית',    flag: 'images/flags/israel.svg' },
    ];

    get currentLangObj() {
        return this.languages.find(l => l.code === this.currentLang) ?? this.languages[0];
    }

    // ─── Form Fields ───────────────────────────────────────────────────────────
    email: string = '';
    password: string = '';
    isPasswordVisible: boolean = false;

    // ─── State ─────────────────────────────────────────────────────────────────
    isLoading: boolean = false;
    errorMessage: string = '';

    constructor(
        public toggleService: ToggleService,
        private translate: TranslateService,
        private authService: AuthService,
        private router: Router,
    ) {
        this.translate.addLangs(['en', 'ar', 'he']);
        this.translate.setDefaultLang('en');
    }

    ngOnInit(): void {
        this.toggleService.initializeTheme();
        const saved = localStorage.getItem('trezo_lang') || 'en';
        this.applyLanguage(saved);

        // If already logged in, redirect to dashboard
        if (this.authService.getAccessToken()) {
            this.router.navigate(['/dashboard']);
        }
    }

    // ─── Sign In ───────────────────────────────────────────────────────────────
    onSubmit(): void {
        this.errorMessage = '';

        // Client-side validation
        if (!this.email || !this.password) {
            this.translate.get('SIGN_IN.ERROR_REQUIRED').subscribe(msg => {
                this.errorMessage = msg;
            });
            return;
        }

        this.isLoading = true;

        this.authService.signIn({ email: this.email, password: this.password }).subscribe({
            next: () => {
                // Fetch full user profile after sign-in
                this.authService.fetchCurrentUser().subscribe({
                    next: () => {
                        this.isLoading = false;
                        this.router.navigate(['/dashboard']);
                    },
                    error: () => {
                        // Profile fetch failed but sign-in succeeded, still redirect
                        this.isLoading = false;
                        this.router.navigate(['/dashboard']);
                    }
                });
            },
            error: (err) => {
                this.isLoading = false;
                const status = err?.status;
                if (status === 401 || status === 422) {
                    this.translate.get('SIGN_IN.ERROR_INVALID').subscribe(msg => {
                        this.errorMessage = msg;
                    });
                } else {
                    this.translate.get('SIGN_IN.ERROR_GENERIC').subscribe(msg => {
                        this.errorMessage = msg;
                    });
                }
            }
        });
    }

    // ─── Language ──────────────────────────────────────────────────────────────
    applyLanguage(lang: string): void {
        this.currentLang = lang;
        this.translate.use(lang);
        localStorage.setItem('trezo_lang', lang);
        const isRtl = lang === 'ar' || lang === 'he';
        document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', lang);
        this.isLangMenuOpen = false;
    }

    toggleLangMenu(): void {
        this.isLangMenuOpen = !this.isLangMenuOpen;
    }

    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.lang-menu-wrapper')) {
            this.isLangMenuOpen = false;
        }
    }

    // ─── Theme ─────────────────────────────────────────────────────────────────
    toggleTheme(): void {
        this.toggleService.toggleTheme();
    }

    // ─── Password Show/Hide ────────────────────────────────────────────────────
    togglePasswordVisibility(): void {
        this.isPasswordVisible = !this.isPasswordVisible;
    }
}