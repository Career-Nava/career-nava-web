import { inject } from "@angular/core";
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from "../services/auth/auth.service";

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  console.log('%c[AuthGuard] Checking authentication:', 'color: cyan', isAuthenticated);

  if (!isAuthenticated) {
    console.warn('%c[AuthGuard] Not authenticated, redirecting to /sign-in', 'color: red');
    void router.navigate([ '/sign-in' ]);
    return false;
  }

  return true;
};
