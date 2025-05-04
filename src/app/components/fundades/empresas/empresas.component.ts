import { Component, OnInit } from '@angular/core';
import { Empresas } from '../../../models/empresas';
import { EmpresasService } from '../../../services/empresas.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalEmpresaFormComponent } from '../modales/modal-empresa/modal-empresa-form/modal-empresa-form.component';
import { ModalExitoComponent } from '../../shared/modales/modal-exito/modal-exito.component';
import { LoginService } from '../../../services/login.service';
import { UsuariosService } from '../../../services/usuarios.service';

@Component({
  selector: 'app-empresas',
  imports: [],
  templateUrl: './empresas.component.html',
  styleUrl: './empresas.component.css',
})
export class EmpresasComponent implements OnInit {
  empresas: Empresas[] = [];
  miEmpresa: Empresas = new Empresas();

  constructor(
    private dialog: MatDialog,
    private empresaService: EmpresasService,
    private loginService: LoginService,
    private usuarioService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.empresaService.list().subscribe((data) => {
      this.empresas = data;
    });

    this.usuarioService.findIdEmpresaByEmail(this.loginService.showUser()).subscribe((data) => {
      const id = data;

      this.empresaService.listId(id).subscribe((data) => {
        this.miEmpresa = data;
      });

      //console.log('evento id de mi empresa: ' + id, 'mi empresa data: ' + JSON.stringify(this.miEmpresa));
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

    //console.log('evento: enviando empresa a editar: ' + JSON.stringify(empresa));

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
