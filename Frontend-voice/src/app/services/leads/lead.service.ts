import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    Lead,
    LeadCreateRequest,
    LeadUpdateRequest,
    LeadPreviewColumnsResponse,
    LeadUploadResponse,
} from './lead.models';

@Injectable({ providedIn: 'root' })
export class LeadService {

    private readonly base = `${environment.apiUrl}/leads`;

    constructor(private http: HttpClient) {}

    // ─── List ────────────────────────────────────────────────────────────────────

    listLeads(campaignId: string): Observable<Lead[]> {
        return this.http.get<Lead[]>(`${this.base}/${campaignId}`, { withCredentials: true });
    }

    // ─── Create ──────────────────────────────────────────────────────────────────

    createLead(campaignId: string, body: LeadCreateRequest): Observable<Lead> {
        return this.http.post<Lead>(`${this.base}/${campaignId}/create`, body, { withCredentials: true });
    }

    // ─── Update ──────────────────────────────────────────────────────────────────

    updateLead(campaignId: string, leadId: string, body: LeadUpdateRequest): Observable<Lead> {
        return this.http.patch<Lead>(`${this.base}/${campaignId}/${leadId}`, body, { withCredentials: true });
    }

    // ─── Delete ──────────────────────────────────────────────────────────────────

    deleteLead(campaignId: string, leadId: string): Observable<{ status: string; lead_id: string }> {
        return this.http.delete<{ status: string; lead_id: string }>(
            `${this.base}/${campaignId}/${leadId}`,
            { withCredentials: true }
        );
    }

    // ─── Preview Columns (before bulk upload) ────────────────────────────────────

    previewColumns(campaignId: string, file: File): Observable<LeadPreviewColumnsResponse> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<LeadPreviewColumnsResponse>(
            `${this.base}/${campaignId}/preview-columns`,
            formData,
            { withCredentials: true }
        );
    }

    // ─── Bulk Upload ─────────────────────────────────────────────────────────────

    bulkUpload(
        campaignId: string,
        file: File,
        phoneColumn: string,
        nameColumn?: string,
        emailColumn?: string
    ): Observable<LeadUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('phone_column', phoneColumn);
        if (nameColumn) { formData.append('name_column', nameColumn); }
        if (emailColumn) { formData.append('email_column', emailColumn); }
        return this.http.post<LeadUploadResponse>(
            `${this.base}/${campaignId}/upload`,
            formData,
            { withCredentials: true }
        );
    }
}
