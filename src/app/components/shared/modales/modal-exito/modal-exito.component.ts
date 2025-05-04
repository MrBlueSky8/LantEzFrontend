import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-exito',
  imports: [
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './modal-exito.component.html',
  styleUrl: './modal-exito.component.css'
})
export class ModalExitoComponent implements OnInit{
  constructor(
    private dialogRef: MatDialogRef<ModalExitoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
        titulo: string;
        mensajeSecundario?: string;
        iconoUrl?: string;
      },
  ){}

  ngOnInit(): void {
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
