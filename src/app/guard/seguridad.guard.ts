import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { LoginService } from '../services/login.service';

export const segGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const lService = inject(LoginService);
  const router = inject(Router);
  const isLogged = lService.verificar();
  const tokenExpired = lService.isTokenExpired();

  if (!isLogged || tokenExpired) {
    //console.log('evento: sesión invalida, regresando al login');
    localStorage.clear();
    router.navigate(['/login']);
    return false;
  }

  //lista de roles esperados
  const expectedRoles = route.data['roles'] as Array<string> | undefined;

  if (expectedRoles && expectedRoles.length > 0) {
    const userRole = lService.showRole();

    if (!expectedRoles.includes(userRole)) {
      router.navigate(['/homes']); // Si no tiene ninguno de los roles permitidos
      return false;
    }
  }

  return true; // Acceso concedido
};