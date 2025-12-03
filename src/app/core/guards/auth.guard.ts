import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/pages/login/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const isLoggedIn = inject(AuthService).isLoggedIn();
  const router = inject(Router);
  if (isLoggedIn) {
    return true;
  }
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
