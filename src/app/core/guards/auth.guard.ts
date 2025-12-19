import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/pages/login/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const isLoggedIn = inject(AuthService).isLoggedIn();
  const router = inject(Router);
  const _hasRole = inject(AuthService).hasRole;

  const role = route.data['roles'];

  if (isLoggedIn) {
    if (role) {
      if (_hasRole(role)) {
        return true;
      } else {
        return router.createUrlTree(['/no-permission']);
      }
    }
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
