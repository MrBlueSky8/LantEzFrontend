import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { segGuard } from './guard/seguridad.guard';
import { AdminComponent } from './components/admin/admin.component';
import { EvaluadorComponent } from './components/evaluador/evaluador.component';
import { SidenavFundadesComponent } from './components/sidenav-fundades/sidenav-fundades.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sidenav-fundades',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'sidenav-fundades',
    component: SidenavFundadesComponent,
    children: [
      {
        path: 'homes',
        component: HomeComponent,
      },
    ],
    canActivate: [segGuard], // solo construcciones, se debe agregar a cada uno
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
    data: { roles: ['EVALUADOR', 'ADMIN'] },
  },
];
