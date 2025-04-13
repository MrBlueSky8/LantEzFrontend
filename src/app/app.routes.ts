import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { segGuard } from './guard/seguridad.guard';
import { AdminComponent } from './components/admin/admin.component';
import { EvaluadorComponent } from './components/evaluador/evaluador.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'homes',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'homes',
    component: HomeComponent,
    canActivate: [segGuard], // solo construcciones, se debe agregar a cada uno
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [segGuard],
    data: { roles: ['ADMIN', 'SUBADMINISTRADOR'] }, // solo construcciones, se debe agregar a cada uno
  },
  {
    path: 'evaluador',
    component: EvaluadorComponent,
    canActivate: [segGuard], // solo construcciones, se debe agregar a cada uno
    data: { roles: ['EVALUADOR', 'ADMIN'] }
  }
];
