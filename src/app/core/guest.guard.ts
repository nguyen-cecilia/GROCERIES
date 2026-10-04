import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const guestGuard: CanActivateFn = () =>
    inject(AuthService).isAuthenticated() ? inject(Router).createUrlTree(['/']) : true;
