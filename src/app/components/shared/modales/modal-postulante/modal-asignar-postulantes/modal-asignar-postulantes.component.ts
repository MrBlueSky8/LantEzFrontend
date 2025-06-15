import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Postulantes } from '../../../../../models/postulantes';
import { PostulantesService } from '../../../../../services/postulantes.service';
import { PuestosTrabajo } from '../../../../../models/puestos-trabajo';
import { Postulaciones } from '../../../../../models/postulaciones';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ResultadosPostulanteService } from '../../../../../services/resultados-postulante.service';
import { RequerimientosMinimosPuestoService } from '../../../../../services/requerimientos-minimos-puesto.service';
import { PostulacionesService } from '../../../../../services/postulaciones.service';

@Component({
  selector: 'app-modal-asignar-postulantes',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './modal-asignar-postulantes.component.html',
  styleUrl: './modal-asignar-postulantes.component.css'
})
export class ModalAsignarPostulantesComponent implements OnInit {
  formAsignacion!: FormGroup;
  postulantesDisponibles: Postulantes[] = [];

  constructor(
    private dialogRef: MatDialogRef<ModalAsignarPostulantesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { puesto: PuestosTrabajo },
    private fb: FormBuilder,
    private postulanteService: PostulantesService,
    private resultadosPostulanteService: ResultadosPostulanteService,
    private requerimientosService: RequerimientosMinimosPuestoService,
    private postulacionesService: PostulacionesService,
  ) {}

  /*
  ngOnInit(): void {
    this.formAsignacion = this.fb.group({
      postulantes_ids: [[], Validators.required],
    });

    this.postulanteService.listarActivosConResultadosPorEmpresa(this.data.puesto.usuarios.empresas.id!).subscribe({
      next: (postulantes) => this.postulantesDisponibles = postulantes,
      error: (err) => console.error('Error al obtener postulantes:', err)
    });
  }
    */

  ngOnInit(): void {
    this.formAsignacion = this.fb.group({
      postulantes_ids: [[], Validators.required],
    });

    const idEmpresa = this.data.puesto.usuarios.empresas.id!;
    const idPuesto   = this.data.puesto.id!;

    forkJoin({
      disponibles: this.postulanteService.listarActivosConResultadosPorEmpresa(idEmpresa),
      postulaciones: this.postulacionesService.listByPuestoTrabajo(idPuesto)
    }).subscribe({
      next: ({ disponibles, postulaciones }) => {
        // llenar opciones del select
        this.postulantesDisponibles = disponibles;

        // quedarnos sólo con las postulaciones que NO están ocultas
        const visibles = postulaciones
          .filter(p => !p.ocultar)
          .map(p => p.postulante);

        // IDs de esos postulantes para que aparezcan marcados
        const idsAsignados = visibles.map(p => p.id!);
        this.formAsignacion.patchValue({ postulantes_ids: idsAsignados });
      },
      error: (err) => console.error('Error al cargar postulantes:', err)
    });
  }


  guardar(): void {
    //if (this.formAsignacion.invalid) return;

    const selectedIds: number[] = this.formAsignacion.value.postulantes_ids;
    const idEmpresa = this.data.puesto.usuarios.empresas.id!;
    const idPuesto   = this.data.puesto.id!;

    // 1) Traer postulaciones existentes para este puesto
    this.postulacionesService.listByPuestoTrabajo(idPuesto).pipe(
      switchMap((existentes: Postulaciones[]) => {
        // Mapa de postulanteId -> Postulacion
        const mapExistentes = new Map<number, Postulaciones>(
          existentes.map(p => [p.postulante.id!, p])
        );

        // 2) Preparar actualizaciones de ocultar = true/false sobre existentes
        const updates = existentes
          .map(p => {
            const debeOcultar = !selectedIds.includes(p.postulante.id!);
            // sólo actualizamos si realmente cambia el flag
            if (p.ocultar !== debeOcultar) {
              const upd: Postulaciones = { ...p, ocultar: debeOcultar };
              return this.postulacionesService.update(upd);
            }
            return null;
          })
          .filter(o => o !== null) as Observable<any>[];

        // 3) Detectar IDs nuevos (no estaban en existentes)
        const nuevosIds = selectedIds.filter(id => !mapExistentes.has(id));
        const inserts: Observable<any>[] = nuevosIds.map(postulanteId =>
          // calculamos compatibilidad y construimos objeto Postulaciones
          forkJoin({
            resultados: this.resultadosPostulanteService.listByPostulanteAndEmpresa(postulanteId, idEmpresa),
            requerimientos: this.requerimientosService.listbyPuestoId(idPuesto),
            postulante: this.postulanteService.listId(postulanteId)
          }).pipe(
            map(({ resultados, requerimientos, postulante }) => {
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
                postulante,
                puesto_trabajo: this.data.puesto,
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
