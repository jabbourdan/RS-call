import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    OrgPhoneNumber,
    CreatePhoneNumberRequest,
    UpdatePhoneNumberRequest,
    UpdateOrgSettingsRequest,
    PhoneNumberResponse,
    OrgSettingsResponse,
} from './org-phone-number.models';

@Injectable({ providedIn: 'root' })
export class OrgPhoneNumberService {

    private readonly base = `${environment.apiUrl}/organizations/phone-numbers`;

    constructor(private http: HttpClient) {}

    // ─── List phone numbers for current org ──────────────────────────────────────

    list(includeInactive = false): Observable<OrgPhoneNumber[]> {
        let params = new HttpParams();
        if (includeInactive) {
            params = params.set('include_inactive', 'true');
        }
        return this.http.get<OrgPhoneNumber[]>(this.base, {
            withCredentials: true,
            params,
        });
    }

    // ─── Add phone number ────────────────────────────────────────────────────────

    add(body: CreatePhoneNumberRequest): Observable<PhoneNumberResponse> {
        return this.http.post<PhoneNumberResponse>(this.base, body, {
            withCredentials: true,
        });
    }

    // ─── Update phone number ─────────────────────────────────────────────────────

    update(phoneId: string, body: UpdatePhoneNumberRequest): Observable<PhoneNumberResponse> {
        return this.http.patch<PhoneNumberResponse>(`${this.base}/${phoneId}`, body, {
            withCredentials: true,
        });
    }

    // ─── Delete (soft-delete) phone number ───────────────────────────────────────

    delete(phoneId: string): Observable<PhoneNumberResponse> {
        return this.http.delete<PhoneNumberResponse>(`${this.base}/${phoneId}`, {
            withCredentials: true,
        });
    }

    // ─── Update org settings (max_phone_numbers) ─────────────────────────────────

    updateOrgSettings(body: UpdateOrgSettingsRequest): Observable<OrgSettingsResponse> {
        return this.http.patch<OrgSettingsResponse>(
            `${environment.apiUrl}/organizations/settings`,
            body,
            { withCredentials: true }
        );
    }
}
