import { inject } from "@angular/core";
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, Observable, switchMap, take } from 'rxjs';
import { AuthService } from "../services/auth/auth.service";

export const authGuard: CanActivateFn = (route): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.initializeAuth().pipe(
    switchMap(() => authService.authState$.pipe(take(1))),
    map(state => {
      if (state.status !== 'authenticated' || !state.user) {
        return router.createUrlTree([ '/sign-in' ]);
      }

      const allowedRoles = route.data?.[ 'roles' ] as string[] | undefined;

      if (allowedRoles?.length && !allowedRoles.includes(state.user.role)) {
        return router.createUrlTree([ authService.getRedirectUrlForRole(state.user.role) ]);
      }

      return true;
    })
  );
};
