import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
import { ModalAnalisisPostulacionComponent } from '../modales/modal-analisis-postulacion/modal-analisis-postulacion.component';
import { ModalExitoComponent } from '../modales/modal-exito/modal-exito.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


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
    private gptService: GptService,
    private dialog: MatDialog
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
    const segments = this.router.url.split('/');
    const currentSidenav = segments[1]; // sidenav-fundades o sidenav-admin
    const seccion = segments[2]; //.includes('empresas') ? 'empresas' : 'mi-empresa';

    //console.log('evento: current sidenav: ' + currentSidenav);
    this.router.navigate([
      `/${currentSidenav}/${seccion}/puestos-trabajo/ficha`,
      this.puestoSeleccionado.id,
    ]);
  }

  tieneAnalisisIA(): boolean {
    const output = this.postulacionSeleccionada?.ia_output || '';
    return output.trim().length > 0;
  }
  
  solicitarAnalisis(): void {
    //console.log('Análisis solicitado para:', this.seleccionado?.postulante.primer_nombre);
    // Lógica para solicitud de análisis adicional
    if (!this.postulacionSeleccionada || !this.puestoSeleccionado) return;

    const dialogRef = this.dialog.open(ModalAnalisisPostulacionComponent, {
      width: 'auto',
      data: {
        postulacion: this.postulacionSeleccionada,
        puesto: this.puestoSeleccionado
      }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        // Refrescamos datos luego del cierre
        this.postulacionesService.listByPuestoTrabajo(this.puestoSeleccionado.id!).subscribe((postulaciones) => {
          this.postulacionesVisibles = postulaciones.filter(p => !p.ocultar);
          const actualizada = this.postulacionesVisibles.find(p => p.id === this.postulacionSeleccionada?.id);
          if (actualizada) {
            this.seleccionarPostulante(actualizada);
          }
        });

        const dialogSucces = this.dialog.open(ModalExitoComponent, {
                  data: {
                    titulo: 'Información Actualizada',
                    iconoUrl: '/assets/checkicon.svg', // ../../../assets/
                    //mensajeSecundario: 'Te enviamos un correo electrónico con un enlace para reestablecer la contraseña. '
                  },
                });
      }
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

  cambiarEstado(nuevoEstado: 'pendiente' | 'aceptado' | 'rechazado'): void {
    if (!this.postulacionSeleccionada) return;

    const actualizada: Postulaciones = {
      ...this.postulacionSeleccionada,
      estado_postulacion: nuevoEstado
    };

    this.postulacionesService.update(actualizada).subscribe(() => {
      // Recargar postulaciones y refrescar seleccionado
      this.postulacionesService.listByPuestoTrabajo(this.idPuesto).subscribe((lista) => {
        this.postulacionesVisibles = lista.filter(p => !p.ocultar);
        const actual = this.postulacionesVisibles.find(p => p.id === actualizada.id);
        if (actual) this.seleccionarPostulante(actual);
      });
    });
  }

  exportarDetallePDF(): void {
  if (!this.postulacionSeleccionada || !this.puestoSeleccionado || !this.competenciasDetalle.length) {
    return;
  }

  const doc = new jsPDF();

  const postulante = this.postulacionSeleccionada.postulante;
  const edad = new AgePipe().transform(postulante.fechanacimiento);

  doc.setFontSize(16);
  doc.text('Detalle de Evaluación', 14, 20);

  doc.setFontSize(12);
  doc.text(`Puesto: ${this.puestoSeleccionado.nombre_puesto}`, 14, 30);
  doc.text(`Postulante: ${postulante.apellido_p}, ${postulante.primer_nombre}`, 14, 38);
  doc.text(`Edad: ${edad} años`, 14, 46);
  doc.text(`Género: ${postulante.genero}`, 14, 54);
  doc.text(`Ciudad: ${postulante.ciudades.ciudad}`, 14, 62);
  doc.text(`Porcentaje Global: ${Math.round(this.postulacionSeleccionada.porcentaje_compatibilidad)}%`, 14, 70);

  autoTable(doc, {
    startY: 80,
    head: [['Competencia', 'Nivel del Puesto', 'Coincidencia %']],
    body: this.competenciasDetalle.map(c => [
      c.competencia,
      c.nivelPuesto.toString(),
      `${c.coincidencia}%`
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [0, 74, 117],
      textColor: 255,
      fontStyle: 'bold'
    }
  });

  doc.save(`Evaluacion_${postulante.primer_nombre}_${postulante.apellido_p}.pdf`);
}

}
