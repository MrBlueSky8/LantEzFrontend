import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-confirmacion',
  imports: [
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './modal-confirmacion.component.html',
  styleUrl: './modal-confirmacion.component.css'
})
export class ModalConfirmacionComponent implements OnInit{
  constructor(
    private dialogRef: MatDialogRef<ModalConfirmacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
        titulo: string;
        mensajeSecundario?: string;
      },
  ){}

  ngOnInit(): void {
  }

  confirmar(): void {
    this.dialogRef.close(true); // Devuelve true al componente que lo invoca
  }

  cancelar(): void {
    this.dialogRef.close(false); // Devuelve false al componente que lo invoca
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}