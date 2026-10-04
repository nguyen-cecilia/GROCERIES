import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () =>
    inject(AuthService).isAuthenticated() ? true : inject(Router).createUrlTree(['/connexion']);
