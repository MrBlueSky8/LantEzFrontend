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
import { forkJoin } from 'rxjs';
import { AgePipe } from '../../../pipes/age.pipe';
import { PuestoTrabajoService } from '../../../services/puesto-trabajo.service';


interface CompetenciaDetalle {
  competencia: string;
  nivelPuesto: number | 'N/A';
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

  //competencias: CompetenciaDetalle[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postulacionesService: PostulacionesService,
    private resultadosPostulanteService: ResultadosPostulanteService,
    private requerimientosService: RequerimientosMinimosPuestoService,
    private puestosService: PuestoTrabajoService
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
    console.log('Seleccionado:', postulacion.postulante.primer_nombre);
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
  }
}
