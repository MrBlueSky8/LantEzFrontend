import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ModalAreaFormComponent } from '../../../../admin/modales/modal-area/modal-area-form/modal-area-form.component';
import { PuestosTrabajo } from '../../../../../models/puestos-trabajo';
import { Empresas } from '../../../../../models/empresas';
import { PuestoTrabajoService } from '../../../../../services/puesto-trabajo.service';
import { Areas } from '../../../../../models/area';
import { Usuarios } from '../../../../../models/usuarios';
import { EmpresasService } from '../../../../../services/empresas.service';
import { AreasService } from '../../../../../services/areas.service';
import { UsuariosService } from '../../../../../services/usuarios.service';
import { UsuariosLight } from '../../../../../models/usuariosLight';

@Component({
  selector: 'app-modal-puesto-trabajo-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './modal-puesto-trabajo-form.component.html',
  styleUrl: './modal-puesto-trabajo-form.component.css',
})
export class ModalPuestoTrabajoFormComponent implements OnInit {
  formPuesto!: FormGroup;
  esEdicion = false;

  misAreas: Areas[] = [];
  misUsuarios: UsuariosLight[] = [];
  empresaSeleccionada!: Empresas;

  constructor(
    private dialogRef: MatDialogRef<ModalAreaFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      puesto?: PuestosTrabajo;
      empresa?: Empresas;
      verDetalle?: boolean;
    },
    private fb: FormBuilder,
    private puestosService: PuestoTrabajoService,
    private empresaService: EmpresasService,
    private areaService: AreasService,
    private usuarioService: UsuariosService,
  ) {}

  ngOnInit(): void {
    if (this.data.empresa) {
      this.empresaSeleccionada = this.data.empresa;
    } else if (this.data.puesto?.id) {
      this.empresaService
        .listByPuestoId(this.data.puesto.id)
        .subscribe((data) => {
          this.empresaSeleccionada = data;
        });
    }

    this.areaService.listbyEmpresaId(this.empresaSeleccionada.id).subscribe((data) => {
      this.misAreas = data;
    });

    this.usuarioService.listbyEmpresaId(this.empresaSeleccionada.id).subscribe((data) => {
      this.misUsuarios = data;
    });

    this.esEdicion = !!this.data.empresa;

    this.formPuesto =this.fb.group({
      area_id: [this.data.puesto?.areas.id || '', Validators.required],
      usuario_id: [this.data.puesto?.usuarios.id || '', Validators.required],
      nombre_puesto: [this.data.puesto?.nombre_puesto || '', [Validators.required, Validators.maxLength(150)]],
      descripcion: [this.data.puesto?.descripcion || '', Validators.maxLength(500)],
      fecha_creacion: [this.data.puesto?.fecha_creacion || new Date(Date.now()), Validators.required],
      fecha_actualizacion: [this.data.puesto?.fecha_actualizacion || new Date(Date.now()), Validators.required],

      estado: [this.data.puesto?.estado ?? false, Validators.required],
      aprobado: [this.data.puesto?.aprobado ?? false, Validators.required],
    });

    if(this.data.verDetalle){
      this.formPuesto.disable();
    }else{
      this.formPuesto.get('fecha_creacion')?.disable();
      this.formPuesto.get('fecha_actualizacion')?.disable();
      this.formPuesto.get('estado')?.disable();
      this.formPuesto.get('aprobado')?.disable();
    }
  }

  guardar(): void {
    if (this.formPuesto.invalid) return;

    const nuevoPuesto: PuestosTrabajo = {
      ...this.data.puesto,
      ...this.formPuesto.value,
      areas: this.misAreas.find(c => c.id === this.formPuesto.value.area_id)!,
      usuarios: this.misUsuarios.find(c => c.id === this.formPuesto.value.usuario_id)!,
      fecha_actualizacion: new Date(Date.now()),
      fecha_creacion: this.data.puesto?.fecha_actualizacion || new Date(Date.now())
    };
    delete (nuevoPuesto as any).area_id;
    delete (nuevoPuesto as any).usuario_id;

    const obs = this.esEdicion
      ? this.puestosService.update(nuevoPuesto)
      : this.puestosService.insert(nuevoPuesto);

    obs.subscribe(() => {
      this.puestosService.list().subscribe(data => {
        this.puestosService.setList(data);
        this.dialogRef.close(true);
      });
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
