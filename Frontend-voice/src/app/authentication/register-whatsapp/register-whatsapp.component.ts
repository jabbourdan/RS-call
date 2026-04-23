import { Component, OnInit, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToggleService } from '../../common/header/toggle.service';
import { WhatsappLinkService } from '../../services/whatsapp/whatsapp-link.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-register-whatsapp',
    imports: [RouterLink, NgClass, TranslateModule],
    templateUrl: './register-whatsapp.component.html',
    styleUrl: './register-whatsapp.component.scss'
})
export class RegisterWhatsappComponent implements OnInit {

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

    // ─── Admin contact ─────────────────────────────────────────────────────────
    adminNumber: string = environment.adminWhatsAppNumber ?? '';
    justCopied: boolean = false;

    constructor(
        public toggleService: ToggleService,
        private translate: TranslateService,
        private whatsapp: WhatsappLinkService,
    ) {
        this.translate.addLangs(['en', 'ar', 'he']);
        this.translate.setDefaultLang('en');
    }

    ngOnInit(): void {
        this.toggleService.initializeTheme();
        const saved = localStorage.getItem('trezo_lang') || 'en';
        this.applyLanguage(saved);
    }

    // ─── WhatsApp URL ──────────────────────────────────────────────────────────
    get whatsAppUrl(): string | null {
        const message = this.translate.instant('AUTH_WHATSAPP.REGISTER_MESSAGE_TEMPLATE');
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
            // Clipboard API unavailable (e.g. insecure context). User can select the
            // number text manually — no further UI feedback needed here.
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
