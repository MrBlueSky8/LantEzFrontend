import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PuestosTrabajo } from '../../../../models/puestos-trabajo';
import { Postulantes } from '../../../../models/postulantes';
import { PostulantesService } from '../../../../services/postulantes.service';
import { ResultadosPostulanteService } from '../../../../services/resultados-postulante.service';
import { RequerimientosMinimosPuestoService } from '../../../../services/requerimientos-minimos-puesto.service';
import { PostulacionesService } from '../../../../services/postulaciones.service';
import { PuestoTrabajoService } from '../../../../services/puesto-trabajo.service';
import { Empresas } from '../../../../models/empresas';
import { forkJoin, switchMap, take, tap } from 'rxjs';
import { LoginService } from '../../../../services/login.service';
import { Usuarios } from '../../../../models/usuarios';
import { UsuariosLight } from '../../../../models/usuariosLight';

@Component({
  selector: 'app-modal-asignar-puestos',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './modal-asignar-puestos.component.html',
  styleUrl: './modal-asignar-puestos.component.css'
})
export class ModalAsignarPuestosComponent implements OnInit {
  formAsignacion!: FormGroup;
  puestosDisponibles: PuestosTrabajo[] = [];

  miRol: string = '';
  currentUser!: UsuariosLight;

  constructor(
    private dialogRef: MatDialogRef<ModalAsignarPuestosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { postulante: Postulantes, empresa: Empresas },
    private fb: FormBuilder,
    private postulanteService: PostulantesService,
    private puestosService: PuestoTrabajoService,
    private resultadosPostulanteService: ResultadosPostulanteService,
    private requerimientosService: RequerimientosMinimosPuestoService,
    private postulacionesService: PostulacionesService,
    private loginService: LoginService,
  ) { }

  ngOnInit(): void {
    this.formAsignacion = this.fb.group({
      puestos_ids: [[], Validators.required],
    });

    this.miRol = this.loginService.showRole();

    const idEmpresa = this.data.empresa.id!;
    const idPostulante = this.data.postulante.id!;

    const esAdminOSubadmin =
      ['ADMINISTRADOR', 'SUBADMINISTRADOR'].some(r => this.miRol?.includes(r));

    // observable condicional para 'disponibles'
    const disponibles$ = esAdminOSubadmin
      ? this.puestosService.listarPuestosPendientesByEmpresaId(idEmpresa)
      : this.loginService.getCurrentUsuarioLight().pipe(
        take(1),
        tap(u => this.currentUser = u), 
        switchMap(u => this.puestosService.listarPendientesAprobadosByUsuarioId(u.id))
      );

    forkJoin({
      disponibles: disponibles$,
      postulaciones: this.postulacionesService.listByPostulanteId(idPostulante)
    }).subscribe({
      next: ({ disponibles, postulaciones }) => {
        // llenar opciones del select
        this.puestosDisponibles = disponibles;

        // quedarnos sólo con los puestos que NO están ocultas
        const visibles = postulaciones
          .filter(p => !p.ocultar)
          .map(p => p.puesto_trabajo);

        // IDs de esos puestos para que aparezcan marcados
        const idsAsignados = visibles.map(p => p.id!);
        this.formAsignacion.patchValue({ puestos_ids: idsAsignados });
      },
      error: (err) => console.error('Error al cargar puestos:', err)
    });
  }
}
