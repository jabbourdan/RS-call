import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    Contact,
    ContactCreateRequest,
    ContactUpdateRequest,
    ContactPreviewColumnsResponse,
    ContactUploadResponse,
} from './contact.models';

@Injectable({ providedIn: 'root' })
export class ContactService {

    private readonly base = `${environment.apiUrl}/contacts`;

    constructor(private http: HttpClient) {}

    // ─── List ────────────────────────────────────────────────────────────────────

    listContacts(): Observable<Contact[]> {
        return this.http.get<Contact[]>(`${this.base}/`, { withCredentials: true });
    }

    // ─── Get Single ──────────────────────────────────────────────────────────────

    getContact(contactId: string): Observable<Contact> {
        return this.http.get<Contact>(`${this.base}/${contactId}`, { withCredentials: true });
    }

    // ─── Create ──────────────────────────────────────────────────────────────────

    createContact(body: ContactCreateRequest): Observable<Contact> {
        return this.http.post<Contact>(`${this.base}/`, body, { withCredentials: true });
    }

    // ─── Update ──────────────────────────────────────────────────────────────────

    updateContact(contactId: string, body: ContactUpdateRequest): Observable<Contact> {
        return this.http.patch<Contact>(`${this.base}/${contactId}`, body, { withCredentials: true });
    }

    // ─── Delete ──────────────────────────────────────────────────────────────────

    deleteContact(contactId: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${contactId}`, { withCredentials: true });
    }

    // ─── Preview Columns (before bulk upload) ────────────────────────────────────

    previewColumns(file: File): Observable<ContactPreviewColumnsResponse> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<ContactPreviewColumnsResponse>(
            `${this.base}/preview-columns`,
            formData,
            { withCredentials: true }
        );
    }

    // ─── Bulk Upload ─────────────────────────────────────────────────────────────

    bulkUpload(
        file: File,
        nameColumn: string,
        phoneColumn?: string,
        emailColumn?: string
    ): Observable<ContactUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name_column', nameColumn);
        if (phoneColumn) { formData.append('phone_column', phoneColumn); }
        if (emailColumn) { formData.append('email_column', emailColumn); }
        return this.http.post<ContactUploadResponse>(
            `${this.base}/upload`,
            formData,
            { withCredentials: true }
        );
    }
}
