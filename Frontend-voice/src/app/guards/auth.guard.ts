import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router      = inject(Router);

    if (authService.getAccessToken()) {
        return true;
    }

    // Not logged in – redirect to sign-in
    return router.createUrlTree(['/authentication/sign-in']);
};
