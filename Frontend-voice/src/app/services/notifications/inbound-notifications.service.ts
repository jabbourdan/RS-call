import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, interval } from 'rxjs';
import { switchMap, catchError, of } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface InboundNotificationItem {
    notification_id: string;
    kind: string;
    caller_display: string;
    campaign_name: string | null;
    lead_id: string | null;
    call_id: string | null;
    unknown_id: string | null;
    created_at: string;
    read_at: string | null;
}

export interface InboundNotificationsResponse {
    unread_count: number;
    items: InboundNotificationItem[];
}

export interface UnknownInboundItem {
    unknown_id: string;
    caller_phone: string | null;
    caller_phone_domestic: string | null;
    to_phone: string;
    received_at: string;
    call_duration_sec: number | null;
    outcome: string | null;
    converted_to_lead_id: string | null;
}

@Injectable({ providedIn: 'root' })
export class InboundNotificationsService implements OnDestroy {

    private pollSub: Subscription | null = null;

    private readonly _items = signal<InboundNotificationItem[]>([]);
    private readonly _unreadCount = signal<number>(0);

    readonly items = this._items.asReadonly();
    readonly unreadCount = this._unreadCount.asReadonly();
    readonly hasUnread = computed(() => this._unreadCount() > 0);

    constructor(private http: HttpClient) {}

    refresh(): Observable<InboundNotificationsResponse> {
        return this.http
            .get<InboundNotificationsResponse>(
                `${environment.apiUrl}/calls/inbound-notifications?limit=50`,
                { withCredentials: true }
            );
    }

    start(): void {
        if (this.pollSub) return;

        // Fire once immediately so the bell reflects truth on page load.
        this.refresh().pipe(catchError(() => of(null))).subscribe((res) => {
            if (res) this.applyResponse(res);
        });

        this.pollSub = interval(15000)
            .pipe(
                switchMap(() => this.refresh().pipe(catchError(() => of(null))))
            )
            .subscribe((res) => {
                if (res) this.applyResponse(res);
            });
    }

    stop(): void {
        this.pollSub?.unsubscribe();
        this.pollSub = null;
    }

    markRead(notificationId: string): Observable<any> {
        return this.http.post(
            `${environment.apiUrl}/calls/inbound-notifications/${notificationId}/read`,
            {},
            { withCredentials: true }
        );
    }

    markAllRead(): Observable<any> {
        return this.http.post(
            `${environment.apiUrl}/calls/inbound-notifications/mark-all-read`,
            {},
            { withCredentials: true }
        );
    }

    dismiss(notificationId: string): Observable<any> {
        return this.http.delete(
            `${environment.apiUrl}/calls/inbound-notifications/${notificationId}`,
            { withCredentials: true }
        );
    }

    clearAll(readOnly = false): Observable<any> {
        const q = readOnly ? '?read_only=true' : '';
        return this.http.delete(
            `${environment.apiUrl}/calls/inbound-notifications${q}`,
            { withCredentials: true }
        );
    }

    listUnknownInbounds(includeConverted = false): Observable<UnknownInboundItem[]> {
        const q = includeConverted ? '?include_converted=true' : '';
        return this.http.get<UnknownInboundItem[]>(
            `${environment.apiUrl}/calls/unknown-inbounds${q}`,
            { withCredentials: true }
        );
    }

    private applyResponse(res: InboundNotificationsResponse): void {
        this._items.set(res.items);
        this._unreadCount.set(res.unread_count);
    }

    ngOnDestroy(): void {
        this.stop();
    }
}
