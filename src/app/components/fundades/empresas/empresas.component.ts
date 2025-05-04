import { Component, OnInit } from '@angular/core';
import { Empresas } from '../../../models/empresas';
import { EmpresasService } from '../../../services/empresas.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalEmpresaFormComponent } from '../modales/modal-empresa/modal-empresa-form/modal-empresa-form.component';
import { ModalExitoComponent } from '../../shared/modales/modal-exito/modal-exito.component';

@Component({
  selector: 'app-empresas',
  imports: [],
  templateUrl: './empresas.component.html',
  styleUrl: './empresas.component.css',
})
export class EmpresasComponent implements OnInit {
  empresas: Empresas[] = [];

  constructor(
    private dialog: MatDialog,
    private empresaService: EmpresasService
  ) {}

  ngOnInit(): void {
    this.empresaService.list().subscribe((data) => {
      this.empresas = data;
    });
  }

  abrirModalCrear(): void {
    const dialogRef = this.dialog.open(ModalEmpresaFormComponent, {
      width: 'auto',
      data: {},
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        console.log('Empresa creada');
      }
    });
  }

  abrirModalEditar(): void {
    const empresa = this.empresas[0];
    if (!empresa) return;

    const dialogRef = this.dialog.open(ModalEmpresaFormComponent, {
      width: 'auto',
      data: { empresa }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        console.log('Empresa editada');
        this.empresaService.list().subscribe((data) => {
          this.empresas = data;
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

}
