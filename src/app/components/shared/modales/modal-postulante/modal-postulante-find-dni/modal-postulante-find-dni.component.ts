import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PostulantesService } from '../../../../../services/postulantes.service';

@Component({
  selector: 'app-modal-postulante-find-dni',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './modal-postulante-find-dni.component.html',
  styleUrl: './modal-postulante-find-dni.component.css'
})
export class ModalPostulanteFindDniComponent implements OnInit {
  formDNI!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModalPostulanteFindDniComponent>,
    private postulanteService: PostulantesService
  ) {}

  ngOnInit(): void {
    this.formDNI = this.fb.group({
      numero_doc: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]]
    });
  }

  validar(): void {
    if (this.formDNI.invalid) {
      this.formDNI.markAllAsTouched();
      return;
    }

    const dni = this.formDNI.value.numero_doc;

    this.postulanteService.validarDniExistente(dni).subscribe({
      next: (existe) => {
        if (existe) {
          this.dialogRef.close({ existe: true, dni });
        } else {
          this.dialogRef.close({ existe: false, dni });
        }
      },
      error: (err) => {
        console.error('Error al validar DNI:', err);
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
