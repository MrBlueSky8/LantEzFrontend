import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Empresas } from '../../../models/empresas';
import { EmpresasService } from '../../../services/empresas.service';
import { LoginService } from '../../../services/login.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { Router } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ModalEmpresaFormComponent } from '../../fundades/modales/modal-empresa/modal-empresa-form/modal-empresa-form.component';
import { ModalExitoComponent } from '../../shared/modales/modal-exito/modal-exito.component';

@Component({
  selector: 'app-mi-empresa',
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-empresa.component.html',
  styleUrl: './mi-empresa.component.css',
})
export class MiEmpresaComponent implements OnInit {
  miEmpresa: Empresas = new Empresas();

  constructor(
    private dialog: MatDialog,
    private empresaService: EmpresasService,
    private loginService: LoginService,
    private usuarioService: UsuariosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.asignarMiempresa();
  }

  asignarMiempresa(): void{
    this.usuarioService.findIdEmpresaByEmail(this.loginService.showUser()).subscribe({
      next: (id) => {
        this.empresaService.listId(id).subscribe({
          next: (empresa) => {
            this.miEmpresa = empresa;
            console.log('evento id de mi empresa: ' + id, 'mi empresa data: ' + JSON.stringify(this.miEmpresa));
          },
          error: (err) => console.error('Error al obtener la empresa:', err)
        });
      },
      error: (err) => console.error('Error al obtener ID de empresa:', err),
    });
  }

  gestionarAreas(): void{
    console.log('evento: click gestionar areas');
    this.router.navigate(['/sidenav-admin/mi-empresa/areas']);
  }

  gestionarPuestos(): void{
    console.log('evento: click gestionar puestos');
    this.router.navigate(['/sidenav-admin/mi-empresa/puestos-trabajo']);
  }

  editarMiEmpresa(): void{

    //this.abrirModalEditar(this.miEmpresa);
    
    const dialogRef = this.dialog.open(ModalEmpresaFormComponent, {
            width: 'auto',
            data: { empresa: this.miEmpresa, verDetalle: true },
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

    onImgError(event: Event): void {
    const element = event.target as HTMLImageElement;
    
    if (!element.src.includes('empresaDefault.png')) {
      element.src = '/assets/empresaDefault.png';
    }
  }
}
