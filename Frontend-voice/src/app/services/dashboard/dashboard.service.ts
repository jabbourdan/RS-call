import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardOverview } from './dashboard.models';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    constructor(private http: HttpClient) {}

    getOverview(): Observable<DashboardOverview> {
        return this.http.get<DashboardOverview>(
            `${environment.apiUrl}/dashboard/overview`,
            { withCredentials: true }
        );
    }
}
