import { Component, OnInit, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToggleService } from '../../common/header/toggle.service';

@Component({
    selector: 'app-sign-up',
    imports: [RouterLink, NgClass, TranslateModule],
    templateUrl: './sign-up.component.html',
    styleUrl: './sign-up.component.scss'
})
export class SignUpComponent implements OnInit {

    currentLang: string = 'en';
    isLangMenuOpen: boolean = false;

    languages = [
        { code: 'en', label: 'English', flag: 'images/flags/usa.svg' },
        { code: 'ar', label: 'العربية', flag: 'images/flags/saudi-arabia.svg' },
        { code: 'he', label: 'עברית',   flag: 'images/flags/israel.svg' },
    ];

    get currentLangObj() {
        return this.languages.find(l => l.code === this.currentLang) ?? this.languages[0];
    }

    constructor(
        public toggleService: ToggleService,
        private translate: TranslateService
    ) {
        this.translate.addLangs(['en', 'ar', 'he']);
        this.translate.setDefaultLang('en');
    }

    ngOnInit(): void {
        this.toggleService.initializeTheme();
        const saved = localStorage.getItem('trezo_lang') || 'en';
        this.applyLanguage(saved);
    }

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

    toggleTheme() {
        this.toggleService.toggleTheme();
    }

    // Password Show/Hide
    password: string = '';
    isPasswordVisible: boolean = false;
    togglePasswordVisibility(): void {
        this.isPasswordVisible = !this.isPasswordVisible;
    }
    onPasswordInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        this.password = inputElement.value;
    }
}