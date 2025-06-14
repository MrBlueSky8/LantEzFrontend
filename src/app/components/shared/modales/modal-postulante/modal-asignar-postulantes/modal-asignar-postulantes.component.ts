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
import { forkJoin, map, switchMap } from 'rxjs';
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
    const idPuesto = this.data.puesto.id!;

    forkJoin({
      disponibles: this.postulanteService.listarActivosConResultadosPorEmpresa(idEmpresa),
      asignados: this.postulanteService.listarPorPuestoId(idPuesto),
    }).subscribe({
      next: ({ disponibles, asignados }) => {
        this.postulantesDisponibles = disponibles;

        const idsAsignados = asignados.map(p => p.id);
        this.formAsignacion.patchValue({ postulantes_ids: idsAsignados });
      },
      error: (err) => {
        console.error('Error al cargar postulantes:', err);
      }
    });
  }

  guardar(): void {
    if (this.formAsignacion.invalid) return;

    const postulanteIds: number[] = this.formAsignacion.value.postulantes_ids;

    const postulacionesObservables = postulanteIds.map(postulanteId => {
      return forkJoin({
        resultadosPostulante: this.resultadosPostulanteService.listByPostulanteAndEmpresa(
          postulanteId, this.data.puesto.areas.empresas.id!
        ),
        requerimientosPuesto: this.requerimientosService.listbyPuestoId(
          this.data.puesto.id!
        ),
        postulante: this.postulanteService.listId(postulanteId)
      }).pipe(
        map(({ resultadosPostulante, requerimientosPuesto, postulante }) => {
          
          const requerimientosActivos = requerimientosPuesto.filter(r => r.estado);
          let totalCompatibilidad = 0;
          let count = 0;

          requerimientosActivos.forEach(requerimiento => {
            // Extraer número inicial de la pregunta del puesto
            const numPreguntaReq = parseInt(requerimiento.pregunta_perfil.pregunta.split('.')[0].trim());

            // Encontrar la respuesta equivalente en los resultados del postulante por número de pregunta
            const resultado = resultadosPostulante.find(r => {
              const numPreguntaRes = parseInt(r.pregunta_perfil.pregunta.split('.')[0].trim());
              return numPreguntaReq === numPreguntaRes;
            });

            if (resultado) {
              const compatibilidad = (resultado.resultado_pregunta_obtenido / requerimiento.resultado_minimo) * 100;
              totalCompatibilidad += compatibilidad;//Math.min(compatibilidad, 100); // Limitar compatibilidad máxima a 100%
              count++;
            }
          });

          const promedioCompatibilidad = count > 0 ? totalCompatibilidad / count : 0;

          return {
            id: 0,
            postulante: postulante,
            puesto_trabajo: this.data.puesto,
            fecha_postulacion: new Date(),
            estado_postulacion: 'pendiente',
            aprobado: false,
            porcentaje_compatibilidad: promedioCompatibilidad,
            ia_output: '',
            evaluador_comentario: '',
            ocultar: false,
          } as Postulaciones;
        })
      );
    });

    forkJoin(postulacionesObservables).pipe(
      switchMap((postulacionesData: Postulaciones[]) =>
        this.postulacionesService.upsertMultiple(postulacionesData)
      )
    ).subscribe({
      next: () => {
        console.log('Postulaciones asignadas exitosamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al asignar postulaciones:', err);
      }
    });
  }



  cerrar(): void {
    this.dialogRef.close();
  }
}
