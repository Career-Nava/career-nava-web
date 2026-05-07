import { inject } from "@angular/core";
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from "../services/auth/auth.service";

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    void router.navigate([ '/sign-in' ]);
    return false;
  }

  const user = authService.getUser();
  const allowedRoles = route.data?.[ 'roles' ] as string[] | undefined;

  if (!user) {
    void router.navigate([ '/sign-in' ]);
    return false;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    void router.navigate([ authService.getRedirectUrlForRole(user.role) ]);
    return false;
  }

  return true;
};
