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
import { forkJoin, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { LoginService } from '../../../../services/login.service';
import { Usuarios } from '../../../../models/usuarios';
import { UsuariosLight } from '../../../../models/usuariosLight';
import { Postulaciones } from '../../../../models/postulaciones';

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

  guardar(): void {
    //if (this.formAsignacion.invalid) return;

    const selectedIds: number[] = this.formAsignacion.value.puestos_ids;
    const idEmpresa = this.data.empresa.id!;
    const idPostulante = this.data.postulante.id!;

    // 1) Traer postulaciones existentes para este puesto
    this.postulacionesService.listByPostulanteId(idPostulante).pipe(
      switchMap((existentes: Postulaciones[]) => {
        // Mapa de postulanteId -> Postulacion
        const mapExistentes = new Map<number, Postulaciones>(
          existentes.map(p => [p.puesto_trabajo.id!, p])
        );

        // 2) Preparar actualizaciones de ocultar = true/false sobre existentes
        const updates = existentes
          .map(p => {
            const debeOcultar = !selectedIds.includes(p.puesto_trabajo.id!);
            // sólo actualizamos si realmente cambia el flag
            if (p.ocultar !== debeOcultar) {
              const upd: Postulaciones = { ...p, ocultar: debeOcultar };
              return this.postulacionesService.update(upd);
            }
            return null;
          })
          .filter(o => o !== null) as Observable<any>[]; //acá llegué

        // 3) Detectar IDs nuevos (no estaban en existentes)
        const nuevosIds = selectedIds.filter(id => !mapExistentes.has(id));
        const inserts: Observable<any>[] = nuevosIds.map(puestoId =>
          // calculamos compatibilidad y construimos objeto Postulaciones
          forkJoin({
            resultados: this.resultadosPostulanteService.listByPostulanteAndEmpresa(idPostulante, idEmpresa),
            requerimientos: this.requerimientosService.listbyPuestoId(puestoId),
            //postulante: this.postulanteService.listId(idPostulante)
            puesto_trabajo: this.puestosService.listId(puestoId)
          }).pipe(
            map(({ resultados, requerimientos, puesto_trabajo }) => {
              const activos = requerimientos.filter(r => r.estado);
              let suma = 0, count = 0;
              activos.forEach(rq => {
                const numReq = +rq.pregunta_perfil.pregunta.split('.')[0];
                const res = resultados.find(rr => +rr.pregunta_perfil.pregunta.split('.')[0] === numReq);
                if (res) {
                  //console.log('evento: ' + numReq + ' ' + res.resultado_pregunta_obtenido + '/' + rq.resultado_minimo + '= ' + ((res.resultado_pregunta_obtenido / rq.resultado_minimo) * 100));
                  //console.log('evento count: ' + count);
                  suma += (res.resultado_pregunta_obtenido / rq.resultado_minimo) * 100;
                  count++;
                }
              });
              const prom = count ? suma / count : 0;
              const nueva: Postulaciones = {
                id: 0,
                postulante: this.data.postulante,
                puesto_trabajo,
                fecha_postulacion: new Date(),
                estado_postulacion: 'pendiente',
                aprobado: false,
                porcentaje_compatibilidad: prom,
                ia_output: '',
                evaluador_comentario: '',
                ocultar: false
              };
              return nueva;
            }),
            switchMap(nuevaPost => this.postulacionesService.insert(nuevaPost))
          )
        );

        // 4) Ejecutar todas las operaciones en paralelo
        return updates.concat(inserts).length
          ? forkJoin([...updates, ...inserts])
          : of(null);
      })
    ).subscribe({
      next: () => {
        console.log('Asignaciones procesadas correctamente.');
        this.dialogRef.close(true);
      },
      error: err => {
        console.error('Error al procesar asignaciones:', err);
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
