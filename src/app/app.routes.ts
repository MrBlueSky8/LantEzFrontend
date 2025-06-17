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
import { SidenavAdminComponent } from './components/sidenav-admin/sidenav-admin.component';
import { MiEmpresaComponent } from './components/admin/mi-empresa/mi-empresa.component';
import { SidenavEvaluadorComponent } from './components/sidenav-evaluador/sidenav-evaluador.component';
import { MisTrabajosComponent } from './components/shared/mis-trabajos/mis-trabajos.component';
import { AppModuloEnDesarrolloComponent } from './components/shared/app-modulo-en-desarrollo/app-modulo-en-desarrollo.component';
import { AreasComponent } from './components/admin/areas/areas.component';
import { PuestosTrabajoComponent } from './components/admin/puestos-trabajo/puestos-trabajo.component';
import { AreasFundadesComponent } from './components/fundades/areas-fundades/areas-fundades.component';
import { UsuariosFundadesComponent } from './components/fundades/usuarios-fundades/usuarios-fundades.component';
import { RequerimientosMinimosPuestoComponent } from './components/shared/requerimientos-minimos-puesto/requerimientos-minimos-puesto.component';
import { PuestosTrabajoFundadesComponent } from './components/fundades/puestos-trabajo-fundades/puestos-trabajo-fundades.component';
import { ResultadosPostulanteComponent } from './components/shared/resultados-postulante/resultados-postulante.component';
import { PostulantesFundadesComponent } from './components/fundades/postulantes-fundades/postulantes-fundades.component';
import { IngresarEvaluacionComponent } from './components/shared/ingresar-evaluacion/ingresar-evaluacion.component';
import { EvaluacionesFundadesComponent } from './components/fundades/evaluaciones-fundades/evaluaciones-fundades.component';
import { EvaluacionesEvaluadorComponent } from './components/evaluador/evaluaciones-evaluador/evaluaciones-evaluador.component';

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
        component: UsuariosFundadesComponent,
      },
      {
        path: 'postulantes',
        component: PostulantesFundadesComponent,
      },
      {
        path: 'evaluadores',
        component: EvaluadoresComponent,
      },
      {
        path: 'evaluaciones',
        component: EvaluacionesFundadesComponent,
      },
      {
        path: 'ajustes',
        component: AjustesGeneralesComponent,
      },
      {
      path: 'empresas/areas',
      component:AreasFundadesComponent,
      //component: AreasComponent,
      },
      {
        path: 'empresas/puestos-trabajo',
        component: PuestosTrabajoFundadesComponent,
      },
      {
        path: 'empresas/puestos-trabajo/ficha/:id',
        component: RequerimientosMinimosPuestoComponent,
      },
      {
        path: 'postulantes/resultados/:id/empresa/:empresaId',
        component: ResultadosPostulanteComponent,
      },
      {
        path: 'evaluaciones/gestion/puesto/:id',
        component: IngresarEvaluacionComponent,
      },
      {
        path: 'evaluaciones/puestos-trabajo/ficha/:id',
        component: RequerimientosMinimosPuestoComponent,
      },
      
    ],
    canActivate: [segGuard],
    data: { roles: ['ADMINISTRADOR FUNDADES', 'SUBADMINISTRADOR FUNDADES'] }, // solo construcciones, se debe agregar a cada uno
  },
  {
    path: 'sidenav-admin',
    component: SidenavAdminComponent,
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
        path: 'mi-empresa',
        component: MiEmpresaComponent,
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
      },
      {
      path: 'mi-empresa/areas',
      component:AreasComponent,
      //component: AreasComponent,
      },
      {
        path: 'mi-empresa/puestos-trabajo',
        component: PuestosTrabajoComponent,
      },
      {
        path: 'mi-empresa/puestos-trabajo/ficha/:id',
        component: RequerimientosMinimosPuestoComponent,
      },
      {
        path: 'postulantes/resultados/:id/empresa/:empresaId',
        component: ResultadosPostulanteComponent,
      },
      {
        path: 'evaluaciones/gestion/puesto/:id',
        component: IngresarEvaluacionComponent,
      },
      {
        path: 'evaluaciones/puestos-trabajo/ficha/:id',
        component: RequerimientosMinimosPuestoComponent,
      },
    ],
    canActivate: [segGuard],
    data: { roles: ['ADMINISTRADOR', 'SUBADMINISTRADOR'] }, // solo construcciones, se debe agregar a cada uno
  },
  {
    path: 'sidenav-evaluador',
    component: SidenavEvaluadorComponent,
    children: [
      {
        path: 'homes',
        component: HomeComponent,
      },
      {
        path: 'dashboard',
        component: DashboardFundadesComponent,
      },
      {
        path: 'mis-trabajos',
        component: MisTrabajosComponent,
      },
      {
        path: 'postulantes',
        component: PostulantesComponent,
      },
      {
        path: 'evaluaciones',
        component: EvaluacionesEvaluadorComponent,
      },
      {
        path: 'ajustes',
        component: AjustesGeneralesComponent,
      },
      {
        path: 'postulantes/resultados/:id/empresa/:empresaId',
        component: ResultadosPostulanteComponent,
      },
      {
        path: 'mis-trabajos/ficha/:id',
        component: RequerimientosMinimosPuestoComponent,
      },
      {
        path: 'evaluaciones/gestion/puesto/:id',
        component: IngresarEvaluacionComponent,
      },
      {
        path: 'evaluaciones/puestos-trabajo/ficha/:id',
        component: RequerimientosMinimosPuestoComponent,
      },
    ],
    canActivate: [segGuard],
    data: { roles: ['ADMINISTRADOR', 'SUBADMINISTRADOR', 'EVALUADOR'] }, // solo construcciones, se debe agregar a cada uno
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
    data: { roles: ['ADMINISTRADOR', 'SUBADMINISTRADOR'] }, // solo construcciones, se debe agregar a cada uno
  },
  {
    path: 'evaluador',
    component: EvaluadorComponent,
    canActivate: [segGuard], // solo construcciones, se debe agregar a cada uno
    data: { roles: ['EVALUADOR', 'ADMIN'] },
  },
  { path: '**', redirectTo: '/homes', pathMatch: 'full' }
];
