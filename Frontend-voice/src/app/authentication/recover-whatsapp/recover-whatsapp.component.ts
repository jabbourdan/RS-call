import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToggleService } from '../../common/header/toggle.service';
import { WhatsappLinkService } from '../../services/whatsapp/whatsapp-link.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-recover-whatsapp',
    imports: [RouterLink, NgClass, FormsModule, TranslateModule],
    templateUrl: './recover-whatsapp.component.html',
    styleUrl: './recover-whatsapp.component.scss'
})
export class RecoverWhatsappComponent implements OnInit {

    // ─── Language ──────────────────────────────────────────────────────────────
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

    // ─── Form + admin contact ──────────────────────────────────────────────────
    email: string = '';
    adminNumber: string = environment.adminWhatsAppNumber ?? '';
    justCopied: boolean = false;

    constructor(
        public toggleService: ToggleService,
        private translate: TranslateService,
        private whatsapp: WhatsappLinkService,
        private router: Router,
    ) {
        this.translate.addLangs(['en', 'ar', 'he']);
        this.translate.setDefaultLang('en');

        // Pre-fill the email from the sign-in page's `[state]="{ email }"` handoff
        // if it was provided. Fall back to history.state for full-page reloads.
        const nav = this.router.getCurrentNavigation();
        const fromNav = nav?.extras?.state?.['email'];
        const fromHistory = (typeof history !== 'undefined' && history.state) ? history.state.email : undefined;
        this.email = (fromNav ?? fromHistory ?? '').toString();
    }

    ngOnInit(): void {
        this.toggleService.initializeTheme();
        const saved = localStorage.getItem('trezo_lang') || 'en';
        this.applyLanguage(saved);
    }

    // ─── WhatsApp URL ──────────────────────────────────────────────────────────
    get whatsAppUrl(): string | null {
        const trimmed = this.email.trim();
        const message = trimmed
            ? this.translate.instant('AUTH_WHATSAPP.RECOVER_MESSAGE_TEMPLATE', { email: trimmed })
            : this.translate.instant('AUTH_WHATSAPP.RECOVER_MESSAGE_TEMPLATE_NO_EMAIL');
        return this.whatsapp.buildChatUrl(this.adminNumber, message);
    }

    // ─── Copy number ───────────────────────────────────────────────────────────
    async copyNumber(): Promise<void> {
        if (!this.adminNumber) {
            return;
        }
        try {
            await navigator.clipboard.writeText(this.adminNumber);
            this.justCopied = true;
            setTimeout(() => { this.justCopied = false; }, 2000);
        } catch {
            // Clipboard API unavailable; user can select the displayed number manually.
        }
    }

    // ─── Language / theme ──────────────────────────────────────────────────────
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

    toggleTheme(): void {
        this.toggleService.toggleTheme();
    }
}
