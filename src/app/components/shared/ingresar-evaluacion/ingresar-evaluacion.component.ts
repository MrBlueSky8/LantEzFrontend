import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { PuestosTrabajo } from '../../../models/puestos-trabajo';
import { Postulaciones } from '../../../models/postulaciones';
import { ActivatedRoute, Router } from '@angular/router';
import { PostulacionesService } from '../../../services/postulaciones.service';
import { ResultadosPostulanteService } from '../../../services/resultados-postulante.service';
import { RequerimientosMinimosPuestoService } from '../../../services/requerimientos-minimos-puesto.service';
import { forkJoin, switchMap } from 'rxjs';
import { AgePipe } from '../../../pipes/age.pipe';
import { PuestoTrabajoService } from '../../../services/puesto-trabajo.service';
import { GptService } from '../../../services/gpt.service';


interface CompetenciaDetalle {
  competencia: string;
  nivelPuesto: number;
  coincidencia: number;
}

@Component({
  selector: 'app-ingresar-evaluacion',
  imports: [
    CommonModule, MatPaginatorModule, FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    AgePipe
  ],
  templateUrl: './ingresar-evaluacion.component.html',
  styleUrl: './ingresar-evaluacion.component.css'
})
export class IngresarEvaluacionComponent implements OnInit {

  idPuesto!: number;
  puestoSeleccionado!: PuestosTrabajo;
  postulacionesVisibles: Postulaciones[] = [];

  postulacionSeleccionada?: Postulaciones;

  competenciasDetalle: CompetenciaDetalle[] = [];
  cargandoCompetencias = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postulacionesService: PostulacionesService,
    private resultadosPostulanteService: ResultadosPostulanteService,
    private requerimientosService: RequerimientosMinimosPuestoService,
    private puestosService: PuestoTrabajoService,
    private gptService: GptService
  ) {}

  ngOnInit(): void {
    this.idPuesto = Number(this.route.snapshot.paramMap.get('id'));

    this.puestosService.listId(this.idPuesto).subscribe((data) => {
      this.puestoSeleccionado = data;
    });

    this.cargarPostulacionesVisibles();

  }

  cargarPostulacionesVisibles(): void {
    this.postulacionesService.listByPuestoTrabajo(this.idPuesto).subscribe({
      next: (postulaciones: Postulaciones[]) => {
        this.postulacionesVisibles = postulaciones.filter(p => !p.ocultar);
      },
      error: (err) => {
        console.error('Error al cargar postulaciones visibles:', err);
      }
    });
  }

  seleccionarPostulante(postulacion: Postulaciones): void {
    this.postulacionSeleccionada = postulacion;
    this.cargandoCompetencias = true;
    const idEmpresa = this.puestoSeleccionado.usuarios.empresas.id!;
    const idPuesto   = this.idPuesto;
    // Traemos requerimientos y resultados en paralelo
    forkJoin({
      requerimientos: this.requerimientosService.listbyPuestoId(idPuesto),
      resultados: this.resultadosPostulanteService.listByPostulanteAndEmpresa(
        postulacion.postulante.id!, idEmpresa
      )
    }).subscribe({
      next: ({ requerimientos, resultados }) => {
        // Filtramos sólo los activos (estado=true)
        const activos = requerimientos.filter(r => r.estado);
        this.competenciasDetalle = activos.map(rq => {
          // coincidencia individual
          const match = resultados.find(rr =>
            +rr.pregunta_perfil.pregunta.split('.')[0] ===
            +rq.pregunta_perfil.pregunta.split('.')[0]
          );
          const porcentaje = match
            ? (match.resultado_pregunta_obtenido / rq.resultado_minimo) * 100
            : 0;
          return {
            competencia: rq.pregunta_perfil.pregunta,
            nivelPuesto: rq.resultado_minimo,
            coincidencia: Math.round(porcentaje)
          };
        });
        this.cargandoCompetencias = false;
      },
      error: err => {
        console.error('Error cargando competencias:', err);
        this.cargandoCompetencias = false;
      }
    });
  }

  refrescarCruce(): void {
    if (!this.postulacionSeleccionada) return;

    const original = this.postulacionSeleccionada;
    const postulanteId = original.postulante.id!;
    const idEmpresa    = this.puestoSeleccionado.usuarios.empresas.id!;
    const idPuesto     = this.puestoSeleccionado.id!;

    forkJoin({
      requerimientos: this.requerimientosService.listbyPuestoId(idPuesto),
      resultados:     this.resultadosPostulanteService.listByPostulanteAndEmpresa(postulanteId, idEmpresa)
    }).pipe(
      switchMap(({ requerimientos, resultados }) => {
        const activos = requerimientos.filter(r => r.estado);
        let suma = 0, count = 0;

        activos.forEach(rq => {
          const key = +rq.pregunta_perfil.pregunta.split('.')[0];
          const match = resultados.find(rr =>
            +rr.pregunta_perfil.pregunta.split('.')[0] === key
          );
          if (match) {
            suma += (match.resultado_pregunta_obtenido / rq.resultado_minimo) * 100;
            count++;
          }
        });

        const nuevoPorcentaje = count ? suma / count : 0;
        const actualizada: Postulaciones = {
          ...original,
          porcentaje_compatibilidad: nuevoPorcentaje,
          fecha_postulacion: new Date(),
        };

        return this.postulacionesService.upsertMultiple([actualizada]);
      }),
      switchMap(() => this.postulacionesService.listByPuestoTrabajo(idPuesto))
    ).subscribe({
      next: (listaActualizada: Postulaciones[]) => {
        this.postulacionesVisibles = listaActualizada.filter(p => !p.ocultar);

        // Reemplazamos la instancia del seleccionado con la nueva versión actualizada
        const nuevaSeleccion = this.postulacionesVisibles.find(p => p.id === original.id);
        if (nuevaSeleccion) {
          this.seleccionarPostulante(nuevaSeleccion); // Esto refresca el label y todo el binding
        }
        console.log('Cruce actualizado con instancia fresca.');
      },
      error: err => {
        console.error('Error al refrescar el cruce:', err);
      }
    });
  }

  volverAtras(): void {
    this.router.navigate(['/ruta-anterior']); // Ajusta la ruta según corresponda
    const segments = this.router.url.split('/');
    const currentSidenav = segments[1]; // sidenav-fundades o sidenav-admin
    const seccionEvaluacion = segments[2]; //.includes('evaluacion') ? 'evaluacion' : 'mis-evaluaciones';

    //console.log('evento: current sidenav: ' + currentSidenav);
    this.router.navigate([`/${currentSidenav}/${seccionEvaluacion}`]);
  }

  editarEvaluacion(): void {
    console.log('Editando evaluación del puesto:', this.puestoSeleccionado.nombre_puesto);
    // Navegación o lógica de edición
  }

  solicitarAnalisis(): void {
    //console.log('Análisis solicitado para:', this.seleccionado?.postulante.primer_nombre);
    // Lógica para solicitud de análisis adicional
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

}
