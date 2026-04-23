import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WhatsappLinkService {
    buildChatUrl(e164Number: string | null | undefined, message: string): string | null {
        if (!e164Number) {
            return null;
        }
        const digits = e164Number.replace(/\D/g, '');
        if (!digits) {
            return null;
        }
        return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    }
}
