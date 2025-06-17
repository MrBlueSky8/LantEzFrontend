import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Postulaciones } from '../../../../models/postulaciones';
import { PostulacionesService } from '../../../../services/postulaciones.service';
import { PostulantesService } from '../../../../services/postulantes.service';
import { ResultadosPostulanteService } from '../../../../services/resultados-postulante.service';
import { RequerimientosMinimosPuestoService } from '../../../../services/requerimientos-minimos-puesto.service';
import { PuestosTrabajo } from '../../../../models/puestos-trabajo';
import { forkJoin } from 'rxjs';
import { GptService } from '../../../../services/gpt.service';

interface CompetenciaDetalle {
  competencia: string;
  nivelPuesto: number;
  coincidencia: number;
}

@Component({
  selector: 'app-modal-analisis-postulacion',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './modal-analisis-postulacion.component.html',
  styleUrl: './modal-analisis-postulacion.component.css',
})
export class ModalAnalisisPostulacionComponent implements OnInit {
  postulacionSeleccionada?: Postulaciones;
  cargandoCompetencias = false;

  puestoSeleccionado!: PuestosTrabajo;
  idPuesto!: number;

  competenciasDetalle: CompetenciaDetalle[] = [];

  formPostulacion!: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<ModalAnalisisPostulacionComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { postulacion: Postulaciones; puesto: PuestosTrabajo },
    private fb: FormBuilder,
    private postulanteService: PostulantesService,
    private resultadosPostulanteService: ResultadosPostulanteService,
    private requerimientosService: RequerimientosMinimosPuestoService,
    private postulacionesService: PostulacionesService,
    private gptService: GptService
  ) {}

  ngOnInit(): void {
    this.postulacionSeleccionada = this.data.postulacion;
    this.puestoSeleccionado = this.data.puesto;

    this.idPuesto =  this.data.puesto.id;

    this.formPostulacion = this.fb.group({
      evaluador_comentario: [this.data.postulacion?.evaluador_comentario || ''],
      //empresa_nombre: [{ value: this.data.area?.empresas?.nombre || this.data.empresa?.nombre || '', disabled: true }]
    });

    this.seleccionarPostulante(this.data.postulacion);
  }

  seleccionarPostulante(postulacion: Postulaciones): void {
    this.postulacionSeleccionada = postulacion;
    this.cargandoCompetencias = true;
    const idEmpresa = this.puestoSeleccionado.usuarios.empresas.id!;
    const idPuesto = this.idPuesto;
    // Traemos requerimientos y resultados en paralelo
    forkJoin({
      requerimientos: this.requerimientosService.listbyPuestoId(idPuesto),
      resultados: this.resultadosPostulanteService.listByPostulanteAndEmpresa(
        postulacion.postulante.id!,
        idEmpresa
      ),
    }).subscribe({
      next: ({ requerimientos, resultados }) => {
        // Filtramos sólo los activos (estado=true)
        const activos = requerimientos.filter((r) => r.estado);
        this.competenciasDetalle = activos.map((rq) => {
          // coincidencia individual
          const match = resultados.find(
            (rr) =>
              +rr.pregunta_perfil.pregunta.split('.')[0] ===
              +rq.pregunta_perfil.pregunta.split('.')[0]
          );
          const porcentaje = match
            ? (match.resultado_pregunta_obtenido / rq.resultado_minimo) * 100
            : 0;
          return {
            competencia: rq.pregunta_perfil.pregunta,
            nivelPuesto: rq.resultado_minimo,
            coincidencia: Math.round(porcentaje),
          };
        });
        this.cargandoCompetencias = false;
      },
      error: (err) => {
        console.error('Error cargando competencias:', err);
        this.cargandoCompetencias = false;
      },
    });
  }

  solicitarAnalisis(): void {
    const prompt = this.generarPromptEvaluacion();
    if (!prompt) {
      console.warn('No se puede generar el análisis: falta información.');
      return;
    }

    this.gptService.retroalimentacionIndividual(prompt).subscribe({
      next: (respuesta: string) => {
        console.log('IA Output:', respuesta);

        // Actualizamos el campo ia_output en la postulación seleccionada
        const actualizada: Postulaciones = {
          ...this.postulacionSeleccionada!,
          ia_output: respuesta,
        };

        this.postulacionesService.update(actualizada).subscribe({
          next: () => {
            console.log('Retroalimentación guardada correctamente.');
            this.postulacionSeleccionada!.ia_output = respuesta; // opcional
          },
          error: (err) => {
            console.error('Error al guardar la retroalimentación:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error al obtener retroalimentación de la IA:', err);
      },
    });
  }

  private generarPromptEvaluacion(): string {
    console.log('evento: longitud competencias ' + this.competenciasDetalle.length);
    if (!this.postulacionSeleccionada || !this.puestoSeleccionado || this.competenciasDetalle.length === 0) {
      return '';
    }

    const nombrePuesto = this.puestoSeleccionado.nombre_puesto;
    const compatGlobal = Math.round(this.postulacionSeleccionada.porcentaje_compatibilidad || 0);

    let prompt = `Evaluación para el puesto: ${nombrePuesto}\n`;
    prompt += `Porcentaje de compatibilidad global: ${compatGlobal}%\n\n`;

    for (const c of this.competenciasDetalle) {
      const resultadoObtenido = Math.round((c.coincidencia / 100) * c.nivelPuesto);
      prompt += `Competencia: ${c.competencia}\n`;
      prompt += `Nivel requerido: ${c.nivelPuesto}\n`;
      prompt += `Resultado obtenido: ${resultadoObtenido}\n`;
      prompt += `Porcentaje de compatibilidad: ${c.coincidencia}%\n\n`;
    }

    return prompt.trim(); // Elimina saltos finales
  }

  guardar(): void {
    if (this.formPostulacion.invalid) return;

    const nuevaPostulacion: Postulaciones = {
      ...this.postulacionSeleccionada!,
      evaluador_comentario: this.formPostulacion.get('evaluador_comentario')
        ?.value,
    };

    this.postulacionesService.update(nuevaPostulacion).subscribe(() => {
      this.postulacionesService.list().subscribe((data) => {
        this.postulacionesService.setList(data);
        this.dialogRef.close(true);
      });
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
