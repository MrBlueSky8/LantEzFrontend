import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-modal-asignar-puestos',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './modal-asignar-puestos.component.html',
  styleUrl: './modal-asignar-puestos.component.css'
})
export class ModalAsignarPuestosComponent implements OnInit {
  ngOnInit(): void {
    
  }
}
