import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { segGuard } from './guard/seguridad.guard';
import { AdminComponent } from './components/admin/admin.component';
import { EvaluadorComponent } from './components/evaluador/evaluador.component';
import { SidenavFundadesComponent } from './components/sidenav-fundades/sidenav-fundades.component';
import { LogsComponent } from './components/admin/logs/logs.component';
import { DashboardComponent } from './components/shared/dashboard/dashboard.component';
import { EmpresasComponent } from './components/fundades/empresas/empresas.component';
import { DashboardFundadesComponent } from './components/fundades/dashboard-fundades/dashboard-fundades.component';
import { UsuariosComponent } from './components/admin/usuarios/usuarios.component';
import { PostulantesComponent } from './components/shared/postulantes/postulantes.component';
import { EvaluadoresComponent } from './components/admin/evaluadores/evaluadores.component';
import { EvaluacionesComponent } from './components/shared/evaluaciones/evaluaciones.component';
import { AjustesGeneralesComponent } from './components/shared/ajustes-generales/ajustes-generales.component';

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
      {
        path: 'logs',
        component: LogsComponent,
      },
      {
        path: 'dashboard',
        component: DashboardFundadesComponent,
      },
      {
        path: 'empresas',
        component: EmpresasComponent,
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
      },
      {
        path: 'postulantes',
        component: PostulantesComponent,
      },
      {
        path: 'evaluadores',
        component: EvaluadoresComponent,
      },
      {
        path: 'evaluaciones',
        component: EvaluacionesComponent,
      },
      {
        path: 'ajustes',
        component: AjustesGeneralesComponent,
      }
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
