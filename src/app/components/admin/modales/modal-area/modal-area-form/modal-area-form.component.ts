import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Areas } from '../../../../../models/area';
import { Empresas } from '../../../../../models/empresas';
import { AreasService } from '../../../../../services/areas.service';

@Component({
  selector: 'app-modal-area-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './modal-area-form.component.html',
  styleUrl: './modal-area-form.component.css'
})
export class ModalAreaFormComponent implements OnInit {

  formArea!: FormGroup;
  esEdicion = false;

  constructor(
    private dialogRef: MatDialogRef<ModalAreaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { area?: Areas, empresa?: Empresas, verDetalle?: boolean },
    private fb: FormBuilder,
    private areaService: AreasService
  ) {}

  ngOnInit(): void {
    this.esEdicion = !!this.data.area;

    this.formArea = this.fb.group({
      nombre_area: [this.data.area?.nombre_area || '', Validators.required],
      //empresa_nombre: [{ value: this.data.area?.empresas?.nombre || this.data.empresa?.nombre || '', disabled: true }]
    });

    if (this.data.verDetalle) {
      this.formArea.disable();
    }
  }

  guardar(): void {
    if (this.formArea.invalid) return;

    const nuevaArea: Areas = {
      ...this.data.area,
      ...this.formArea.value,
      nombre_area: this.formArea.get('nombre_area')?.value,
      empresas: this.data.area?.empresas || this.data.empresa!
    };
    delete (nuevaArea as any).empresa_nombre;

    const obs = this.esEdicion
      ? this.areaService.update(nuevaArea)
      : this.areaService.insert(nuevaArea);

    obs.subscribe(() => {
      this.areaService.list().subscribe(data => {
        this.areaService.setList(data);
        this.dialogRef.close(true);
      });
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

}
