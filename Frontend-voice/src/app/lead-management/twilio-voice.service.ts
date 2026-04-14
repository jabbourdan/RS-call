import { Injectable, OnDestroy } from '@angular/core';
import { Device, Call } from '@twilio/voice-sdk';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { LeadManagementService } from '../services/lead-management/lead-management.service';

export type TwilioDeviceState = 'unregistered' | 'registering' | 'registered' | 'error';

/**
 * Low-level Twilio Voice SDK wrapper.
 *
 * Handles:
 *  - Fetching access token from backend
 *  - Creating / registering the Twilio Device
 *  - Accepting incoming calls (auto-accept during roll)
 *  - Mute / DTMF / hangup on the active call
 *  - Token refresh on expiry
 *  - Full teardown
 */
@Injectable({ providedIn: 'root' })
export class TwilioVoiceService implements OnDestroy {

    private device: Device | null = null;
    private activeCall: Call | null = null;

    // ── Observables ──────────────────────────────────────────────────────────
    private readonly _deviceState$ = new BehaviorSubject<TwilioDeviceState>('unregistered');
    private readonly _incomingCall$ = new BehaviorSubject<Call | null>(null);
    private readonly _isMuted$ = new BehaviorSubject<boolean>(false);

    readonly state$: Observable<TwilioDeviceState> = this._deviceState$.asObservable();
    readonly incoming$: Observable<Call | null> = this._incomingCall$.asObservable();
    readonly isMuted$: Observable<boolean> = this._isMuted$.asObservable();

    constructor(private lmService: LeadManagementService) {}

    // ── Lifecycle ────────────────────────────────────────────────────────────

    /**
     * Fetch a Twilio access token from the backend and register the Device.
     * Returns a Promise that resolves once the Device is fully registered.
     * Safe to call multiple times — will no-op if already initialized.
     */
    async initialize(): Promise<void> {
        if (this.device) return; // already initialized

        const { token } = await firstValueFrom(this.lmService.getTwilioToken());

        this.device = new Device(token, {
            codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
            closeProtection: true,
        });

        // Create a promise that resolves when the Device is registered
        const registrationPromise = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Twilio Device registration timed out after 10s'));
            }, 10000);

            this.device!.on('registered', () => {
                clearTimeout(timeout);
                this._deviceState$.next('registered');
                resolve();
            });

            this.device!.on('error', (error: unknown) => {
                clearTimeout(timeout);
                this._deviceState$.next('error');
                reject(error);
            });
        });

        // ── Incoming call handler ────────────────────────────────────────
        this.device.on('incoming', (call: Call) => {
            this.activeCall = call;
            this._incomingCall$.next(call);
            this._isMuted$.next(false);

            // Auto-accept — during roll the backend bridges the call to us
            call.accept();

            // Track call disconnect so we clean up local state
            call.on('disconnect', () => {
                this.activeCall = null;
                this._incomingCall$.next(null);
                this._isMuted$.next(false);
            });
        });

        // Handle token expiry — re-fetch and update the Device
        this.device.on('tokenWillExpire', async () => {
            try {
                const { token: newToken } = await firstValueFrom(this.lmService.getTwilioToken());
                this.device?.updateToken(newToken);
            } catch {
                // Token refresh failed — device will eventually error out
                console.error('[TwilioVoiceService] Failed to refresh token');
            }
        });

        this.device.register();
        this._deviceState$.next('registering');

        // Wait until the Device is actually registered before returning
        await registrationPromise;
    }

    // ── Call controls ────────────────────────────────────────────────────────

    /** Mute / unmute the active call */
    setMute(muted: boolean): void {
        if (this.activeCall) {
            this.activeCall.mute(muted);
            this._isMuted$.next(muted);
        }
    }

    /** Toggle mute state */
    toggleMute(): void {
        this.setMute(!this._isMuted$.getValue());
    }

    /** Send DTMF tone (keypad digits) */
    sendDigits(digits: string): void {
        this.activeCall?.sendDigits(digits);
    }

    /** Disconnect the current active call */
    hangup(): void {
        this.activeCall?.disconnect();
        this.activeCall = null;
        this._incomingCall$.next(null);
        this._isMuted$.next(false);
    }

    /** Whether there is an active call right now */
    get hasActiveCall(): boolean {
        return this.activeCall !== null;
    }

    // ── Teardown ─────────────────────────────────────────────────────────────

    /** Completely destroy the Twilio Device and reset all state */
    destroy(): void {
        if (this.activeCall) {
            this.activeCall.disconnect();
            this.activeCall = null;
        }
        if (this.device) {
            this.device.destroy();
            this.device = null;
        }
        this._deviceState$.next('unregistered');
        this._incomingCall$.next(null);
        this._isMuted$.next(false);
    }

    ngOnDestroy(): void {
        this.destroy();
    }
}
