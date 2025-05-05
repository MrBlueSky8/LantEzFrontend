import { Component, OnInit } from '@angular/core';
import { Empresas } from '../../../models/empresas';
import { EmpresasService } from '../../../services/empresas.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalEmpresaFormComponent } from '../modales/modal-empresa/modal-empresa-form/modal-empresa-form.component';
import { ModalExitoComponent } from '../../shared/modales/modal-exito/modal-exito.component';
import { LoginService } from '../../../services/login.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';


@Component({
  selector: 'app-empresas',
  imports: [
    CommonModule,
    MatPaginatorModule
  ],
  templateUrl: './empresas.component.html',
  styleUrl: './empresas.component.css',
})
export class EmpresasComponent implements OnInit {
  empresas: Empresas[] = [];
  miEmpresa: Empresas = new Empresas();
  empresasPaginadas: Empresas[] = [];

  pageSize: number = 6;
  pageIndex: number = 0;

  constructor(
    private dialog: MatDialog,
    private empresaService: EmpresasService,
    private loginService: LoginService,
    private usuarioService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.empresaService.list().subscribe((data) => {
      this.empresas = data;
      this.updateEmpresasPaginadas();
    });

    this.asignarMiempresa();
    
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateEmpresasPaginadas();
  }

  updateEmpresasPaginadas(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.empresasPaginadas = this.empresas.slice(start, end);
  }

  asignarMiempresa(): void{
    this.usuarioService.findIdEmpresaByEmail(this.loginService.showUser()).subscribe({
      next: (id) => {
        this.empresaService.listId(id).subscribe({
          next: (empresa) => {
            this.miEmpresa = empresa;
            //console.log('evento id de mi empresa: ' + id, 'mi empresa data: ' + JSON.stringify(this.miEmpresa));
          },
          error: (err) => console.error('Error al obtener la empresa:', err)
        });
      },
      error: (err) => console.error('Error al obtener ID de empresa:', err),
    });
  }

  gestionarAreas(): void{
    console.log('evento: click gestionar areas');
  }

  gestionarPuestos(): void{
    console.log('evento: click gestionar puestos');
  }

  editarMiEmpresa(): void{

    this.abrirModalEditar(this.miEmpresa);

  }

  abrirModalCrear(): void {
    const dialogRef = this.dialog.open(ModalEmpresaFormComponent, {
      width: 'auto',
      data: {},
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        console.log('Empresa creada');
        this.empresaService.list().subscribe((data) => {
          this.empresas = data;
          this.updateEmpresasPaginadas();
        });
      }
    });
  }

  abrirModalEditar(empresa: Empresas): void {
    //const empresa = this.empresas[0];
    if (!empresa) return;

    //console.log('evento: enviando empresa a editar: ' + JSON.stringify(empresa));

    const dialogRef = this.dialog.open(ModalEmpresaFormComponent, {
      width: 'auto',
      data: { empresa, verDetalle: false }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        console.log('Empresa editada');
        this.empresaService.list().subscribe((data) => {
          this.empresas = data;
        });

        if(empresa.id === this.miEmpresa.id){
          this.asignarMiempresa();
        }

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
