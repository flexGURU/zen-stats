import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../../features/pages/login/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (req.url.includes('/login')) {
    return next(req);
  }
  const accessToken = authService.currentToken();

  if (accessToken) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
    });
    return next(clonedReq);
  }

  return next(req);
};
