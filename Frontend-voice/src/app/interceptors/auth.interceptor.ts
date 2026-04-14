import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
) => {
    const authService = inject(AuthService);
    const token = authService.getAccessToken();

    // Attach Bearer token if available
    const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // On 401, try to refresh token once then retry
            if (error.status === 401 && !req.url.includes('/auth/refresh')) {
                return authService.refreshToken().pipe(
                    switchMap((refreshRes) => {
                        const retried = req.clone({
                            setHeaders: { Authorization: `Bearer ${refreshRes.access_token}` },
                        });
                        return next(retried);
                    }),
                    catchError((refreshErr) => throwError(() => refreshErr))
                );
            }
            return throwError(() => error);
        })
    );
};
