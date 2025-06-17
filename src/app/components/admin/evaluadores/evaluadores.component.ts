import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { getCustomPaginatorIntl } from '../../shared/paginator-config/paginator-intl-es';
import { Empresas } from '../../../models/empresas';
import { UsuariosLight } from '../../../models/usuariosLight';
import { MatDialog } from '@angular/material/dialog';
import { EmpresasService } from '../../../services/empresas.service';
import { LoginService } from '../../../services/login.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { ModalUsuarioFormComponent } from '../modales/modal-usuario/modal-usuario-form/modal-usuario-form.component';
import { ModalExitoComponent } from '../../shared/modales/modal-exito/modal-exito.component';
import { ModalConfirmacionComponent } from '../../shared/modales/modal-confirmacion/modal-confirmacion.component';
import { ModalVerPuestosAsignadosComponent } from '../modales/modal-ver-puestos-asignados/modal-ver-puestos-asignados.component';

@Component({
  selector: 'app-evaluadores',
  imports: [CommonModule, MatPaginatorModule, FormsModule],
  templateUrl: './evaluadores.component.html',
  styleUrl: './evaluadores.component.css',
  providers: [
    { provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() },
  ],
})
export class EvaluadoresComponent implements OnInit {
  miEmpresa: Empresas = new Empresas();
  usuarios: UsuariosLight[] = [];
  usuariosFiltrados: UsuariosLight[] = [];
  usuariosPaginados: UsuariosLight[] = [];
  miCorreo: string = '';
  miRol: string = '';

  filtroBusqueda: string = '';
  pageSize: number = 10;
  pageIndex: number = 0;

  constructor(
    private dialog: MatDialog,
    private empresaService: EmpresasService,
    private loginService: LoginService,
    private usuarioService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.miCorreo = this.loginService.showUser();
    this.miRol = this.loginService.showRole();

    this.usuarioService
      .findIdEmpresaByEmail(this.loginService.showUser())
      .subscribe({
        next: (idEmpresa) => {
          this.empresaService.listId(idEmpresa).subscribe({
            next: (empresa) => {
              this.miEmpresa = empresa;
              this.usuarioService
                .listEvaluadoresPorEmpresaId(this.miEmpresa.id)
                .subscribe({
                  next: (data: UsuariosLight[]) => {
                    //const miCorreo = this.loginService.showUser();
                    this.usuarios = data;

                    this.usuariosFiltrados = [...this.usuarios];
                    this.updateUsuariosPaginados();
                  },
                  error: (err) =>
                    console.error('Error al obtener usuarios:', err),
                });
            },
            error: (err) => console.error('Error al obtener empresa:', err),
          });
        },
        error: (err) => console.error('Error al obtener ID:', err),
      });
  }

  filtrarUsuarios(): void {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(
      (e) =>
        e.primer_nombre?.toLowerCase().includes(filtro) ||
        e.segundo_nombre?.toLowerCase().includes(filtro) ||
        e.apellido_p?.toLowerCase().includes(filtro) ||
        e.apellido_m?.toLowerCase().includes(filtro) ||
        e.numero_doc?.toLowerCase().includes(filtro) ||
        e.telefono?.toLowerCase().includes(filtro) ||
        e.roles.nombre_rol?.toLowerCase().includes(filtro)
    );
    this.pageIndex = 0;
    this.updateUsuariosPaginados();
  }

  updateUsuariosPaginados(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.usuariosPaginados = this.usuariosFiltrados.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateUsuariosPaginados();
  }

  agregarUsuario(): void {
    console.log('Click agregar usuario');
    const dialogRef = this.dialog.open(ModalUsuarioFormComponent, {
      width: 'auto',
      data: { empresa: this.miEmpresa },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        console.log('Usuario creado');
        /*
            const miCorreo = this.loginService.showUser();
            const miRol = this.loginService.showRole();
            */

        this.usuarioService
          .listEvaluadoresPorEmpresaId(this.miEmpresa.id)
          .subscribe((todas) => {
            this.usuarios = todas;

            this.pageIndex = 0;
            //this.updateEmpresasPaginadas();
            this.filtrarUsuarios();
          });
      }
    });
  }

  editarUsuario(usuario: UsuariosLight): void {
    console.log('Click editar usuario:', usuario.primer_nombre);
    if (!usuario) return;

    //console.log('evento: enviando empresa a editar: ' + JSON.stringify(empresa));

    const dialogRef = this.dialog.open(ModalUsuarioFormComponent, {
      width: 'auto',
      data: { usuario, verDetalle: false },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        console.log('Area editada');
        // recargar y filtrar
        this.usuarioService
          .listEvaluadoresPorEmpresaId(this.miEmpresa.id)
          .subscribe((todas) => {
            this.usuarios = todas;

            this.usuariosFiltrados = [...this.usuarios];
            //this.updateEmpresasPaginadas();
            this.filtrarUsuarios();
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

  /*
  verDetalleUsuario(usuario: UsuariosLight): void {
    console.log('Click detalle usuario:', usuario.primer_nombre);

     if (!usuario) return;
    
        //console.log('evento: enviando empresa a editar: ' + JSON.stringify(empresa));
        const dialogRef = this.dialog.open(ModalUsuarioFormComponent, {
          width: 'auto',
          data: { usuario, verDetalle: true },
        });
  }
        */
  verPuestosUsuario(usuario: UsuariosLight): void {
    //console.log('evento: enviando empresa a editar: ' + JSON.stringify(empresa));
    const dialogRef = this.dialog.open(ModalVerPuestosAsignadosComponent, {
      width: 'auto',
      data: { usuario },
    });
  }

  private refrescarUsuarios(): void {
    const miCorreo = this.loginService.showUser();
    const miRol = this.loginService.showRole();

    this.usuarioService
      .listEvaluadoresPorEmpresaId(this.miEmpresa.id)
      .subscribe((todas) => {
        this.usuarios = todas;

        this.pageIndex = 0;
        this.filtrarUsuarios();
      });
  }

  toogleEstadoUsuario(usuario: UsuariosLight): void {
    const accion = usuario.estado ? 'deshabilitar' : 'habilitar';

    const dialogConfirmation = this.dialog.open(ModalConfirmacionComponent, {
      width: 'auto',
      data: {
        titulo: `¿Estás seguro de ${accion} este usuario?`,
      },
    });

    dialogConfirmation.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;

      const operacion = usuario.estado
        ? this.usuarioService.deshabilitar(usuario.id)
        : this.usuarioService.habilitar(usuario.id);

      operacion.subscribe({
        next: () => {
          console.log(
            `Usuario ${usuario.primer_nombre} fue ${accion} correctamente`
          );
          this.refrescarUsuarios(); // actualiza la lista filtrada

          this.dialog.open(ModalExitoComponent, {
            data: {
              titulo: `Usuario ${
                accion === 'deshabilitar' ? 'deshabilitado' : 'habilitado'
              }`,
              iconoUrl: '/assets/checkicon.svg',
            },
          });
        },
        error: () => {
          console.error(`Error al ${accion} usuario ${usuario.primer_nombre}`);
        },
      });
    });
  }
}
