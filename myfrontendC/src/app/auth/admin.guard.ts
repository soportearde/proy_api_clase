import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const adminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Comprobamos si es admin usando el método del servicio
    if (authService.isAdmin()) {
        return true;
    }

    // Si no es admin (o no está logueado), lo mandamos a la página principal
    router.navigate(['/']);
    return false;
};
