import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UsuariosLight } from '../../models/usuariosLight';
import { LoginService } from '../../services/login.service';
import { PostulacionesService } from '../../services/postulaciones.service';
import { PuestoTrabajoService } from '../../services/puesto-trabajo.service';

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
    private puestoTrabajoService: PuestoTrabajoService
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
  }

  irEvaluaciones(): void {
    console.log('Click: Ir a Evaluaciones');
  }

  irUsuarios(): void {
    console.log('Click: Ir a Usuarios');
  }

  irPostulantes(): void {
    console.log('Click: Ir a Postulantes');
  }

  irEvaluadores(): void {
    console.log('Click: Ir a Evaluadores');
  }
}
