import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Empresas } from '../../../../models/empresas';
import { ResultadosPostulanteService } from '../../../../services/resultados-postulante.service';
import { PostulacionesService } from '../../../../services/postulaciones.service';
import { PuestoTrabajoService } from '../../../../services/puesto-trabajo.service';

@Component({
  selector: 'app-modal-resumen-empresa',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './modal-resumen-empresa.component.html',
  styleUrl: './modal-resumen-empresa.component.css'
})
export class ModalResumenEmpresaComponent implements OnInit {
  empresaSeleccionada?: Empresas;

  procesosRealizados!: number; //postulaciones Finalizadas
  procesosPendiente!:number; //postulaciones pendientes
  personasEvaluadas!: number; //postulantes con al menos una ficha de la empresa
  perfilesTrabajo!: number; //puestos de trabajo con requerimientos existentes

  constructor(
    private dialogRef: MatDialogRef<ModalResumenEmpresaComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { empresa: Empresas; },
    private fb: FormBuilder,
    private resultadosPostulanteService: ResultadosPostulanteService,
    private puestosService: PuestoTrabajoService,
    private postulacionesService: PostulacionesService,
  ) {}

  ngOnInit(): void {
    const empresa_id = this.data.empresa.id;

    this.postulacionesService
      .contarPostulacionesFinalizadasPorEmpresa(empresa_id)
      .subscribe({
        next: (count) => (this.procesosRealizados = count),
        error: (err) => console.error('Error contando postulaciones finalizadas:', err),
      });

    this.postulacionesService
      .contarPostulacionesPendientesPorEmpresa(empresa_id)
      .subscribe({
        next: (count) => (this.procesosPendiente = count),
        error: (err) => console.error('Error contando postulaciones pendientes:', err),
      });

    this.resultadosPostulanteService
      .contarPostulantesFichadosPorEmpresa(empresa_id)
      .subscribe({
        next: (count) => (this.personasEvaluadas = count),
        error: (err) => console.error('Error contando postulantes fichados:', err),
      });

    this.puestosService
      .contarPuestosConRequerimientosPorEmpresa(empresa_id)
      .subscribe({
        next: (count) => (this.perfilesTrabajo = count),
        error: (err) => console.error('Error contando puestos con requerimientos:', err),
      });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

}
