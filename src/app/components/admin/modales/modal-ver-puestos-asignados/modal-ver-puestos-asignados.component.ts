import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { EmpresasService } from '../../../../services/empresas.service';
import { LoginService } from '../../../../services/login.service';
import { UsuariosService } from '../../../../services/usuarios.service';
import { PuestoTrabajoService } from '../../../../services/puesto-trabajo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosLight } from '../../../../models/usuariosLight';
import { PuestosTrabajo } from '../../../../models/puestos-trabajo';

@Component({
  selector: 'app-modal-ver-puestos-asignados',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './modal-ver-puestos-asignados.component.html',
  styleUrl: './modal-ver-puestos-asignados.component.css'
})
export class ModalVerPuestosAsignadosComponent implements OnInit {

  puestosTrabajos: PuestosTrabajo[] = [];

  constructor(
    private dialogRef: MatDialogRef<ModalVerPuestosAsignadosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario: UsuariosLight },
    private fb: FormBuilder,
    private empresaService: EmpresasService,
    private loginService: LoginService,
    private usuarioService: UsuariosService,
    private puestosService: PuestoTrabajoService,
  ) {}

  ngOnInit(): void {
   this.puestosService
     .listarPendientesAprobadosByUsuarioId(this.data.usuario?.id)
     .subscribe({
       next: (data: PuestosTrabajo[]) => {
         this.puestosTrabajos = data;
       },
       error: (err) => console.error('Error al obtener puestos:', err),
     });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
