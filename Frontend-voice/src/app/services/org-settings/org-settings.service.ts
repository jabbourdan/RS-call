import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { OrgSettings, OrgSettingsUpdate } from './org-settings.models';

@Injectable({ providedIn: 'root' })
export class OrgSettingsService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/organizations/settings`;

    get(): Observable<OrgSettings> {
        return this.http.get<OrgSettings>(this.baseUrl);
    }

    update(payload: OrgSettingsUpdate): Observable<OrgSettings> {
        return this.http.patch<OrgSettings>(this.baseUrl, payload);
    }
}
