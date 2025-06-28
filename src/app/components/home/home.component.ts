import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UsuariosLight } from '../../models/usuariosLight';
import { LoginService } from '../../services/login.service';
import { PostulacionesService } from '../../services/postulaciones.service';
import { PuestoTrabajoService } from '../../services/puesto-trabajo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  usuario!: UsuariosLight;

  // Indicadores
  totalEvaluacionesRealizadas: number = 0;
  totalEvaluacionesPendientes: number = 0;
  totalPostulantesEvaluados: number = 0;
  totalPostulantesRechazados: number = 0;

  constructor(
    private loginService: LoginService,
    private postulacionesService: PostulacionesService,
    private puestoTrabajoService: PuestoTrabajoService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginService.getCurrentUsuarioLight().subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.cargarDatosDashboard(usuario.id);
      },
      error: (err) => console.error('Error al obtener el usuario logueado:', err),
    });
  }

  cargarDatosDashboard(usuarioId: number): void {
    this.postulacionesService.contarPorUsuarioId(usuarioId).subscribe({
      next: (cantidad) => this.totalEvaluacionesRealizadas = cantidad,
      error: (err) => console.error('Error al contar evaluaciones realizadas:', err),
    });

    this.puestoTrabajoService.contarPendientesPorUsuario(usuarioId).subscribe({
      next: (cantidad) => this.totalEvaluacionesPendientes = cantidad,
      error: (err) => console.error('Error al contar evaluaciones pendientes:', err),
    });

    this.postulacionesService.contarNoPendientesPorUsuario(usuarioId).subscribe({
      next: (cantidad) => this.totalPostulantesEvaluados = cantidad,
      error: (err) => console.error('Error al contar postulantes evaluados:', err),
    });

    this.postulacionesService.contarPostulacionesRechazadas(usuarioId).subscribe({
      next: (cantidad) => this.totalPostulantesRechazados = cantidad,
      error: (err) => console.error('Error al contar postulantes rechazados:', err),
    });
  }

  // Accesos directos (solo logs por ahora)
  irEmpresas(): void {
    console.log('Click: Ir a Empresas');
    const segments = this.router.url.split('/');
      const currentSidenav = segments[1]; // sidenav-fundades o sidenav-admin

      if(this.loginService.showRole() === 'ADMINISTRADOR'){
        this.router.navigate([`/${currentSidenav}/mi-empresa`]);
      }else{ 
        this.router.navigate([`/${currentSidenav}/empresas`]);
      }
  }

  irEvaluaciones(): void {
    console.log('Click: Ir a Evaluaciones');
    const segments = this.router.url.split('/');
      const currentSidenav = segments[1]; // sidenav-fundades o sidenav-admin

      //console.log('evento: current sidenav: ' + currentSidenav);
      this.router.navigate([`/${currentSidenav}/evaluaciones/pendientes`]);
  }

  irUsuarios(): void {
    console.log('Click: Ir a Usuarios');
    const segments = this.router.url.split('/');
      const currentSidenav = segments[1]; // sidenav-fundades o sidenav-admin

      //console.log('evento: current sidenav: ' + currentSidenav);
      this.router.navigate([`/${currentSidenav}/usuarios`]);
  }

  irPostulantes(): void {
    console.log('Click: Ir a Postulantes');
    
    const segments = this.router.url.split('/');
      const currentSidenav = segments[1]; // sidenav-fundades o sidenav-admin

      //console.log('evento: current sidenav: ' + currentSidenav);
      this.router.navigate([`/${currentSidenav}/postulantes`]);
  }

  irEvaluadores(): void {
    console.log('Click: Ir a Evaluadores');

    
    const segments = this.router.url.split('/');
      const currentSidenav = segments[1]; // sidenav-fundades o sidenav-admin

      //console.log('evento: current sidenav: ' + currentSidenav);
      this.router.navigate([`/${currentSidenav}/evaluadores`]);
  }

  get esEvaluador(): boolean {
    return this.loginService.showRole() === 'EVALUADOR';
  }

}
