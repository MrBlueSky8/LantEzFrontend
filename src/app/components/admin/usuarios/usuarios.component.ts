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
import { Usuarios } from '../../../models/usuarios';
import { MatDialog } from '@angular/material/dialog';
import { EmpresasService } from '../../../services/empresas.service';
import { LoginService } from '../../../services/login.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { UsuariosLight } from '../../../models/usuariosLight';
import { ModalConfirmacionComponent } from '../../shared/modales/modal-confirmacion/modal-confirmacion.component';
import { ModalExitoComponent } from '../../shared/modales/modal-exito/modal-exito.component';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, MatPaginatorModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
  providers: [
    { provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() },
  ],
})
export class UsuariosComponent implements OnInit {
  miEmpresa: Empresas = new Empresas();
  usuarios: UsuariosLight[] = [];
  usuariosFiltrados: UsuariosLight[] = [];
  usuariosPaginados: UsuariosLight[] = [];

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
    const miCorreo = this.loginService.showUser();
    const miRol = this.loginService.showRole();

    this.usuarioService
      .findIdEmpresaByEmail(this.loginService.showUser())
      .subscribe({
        next: (idEmpresa) => {
          this.empresaService.listId(idEmpresa).subscribe({
            next: (empresa) => {
              this.miEmpresa = empresa;
              this.usuarioService.listbyEmpresaId(empresa.id!).subscribe({
                next: (data: UsuariosLight[]) => {
                  //const miCorreo = this.loginService.showUser();
                  this.usuarios = data.filter(u => {
                    // No mostrarme a mí mismo
                    if (u.email === miCorreo) return false;

                    // SUBADMINISTRADOR común: no puede ver ADMIN ni SUBADMIN
                    if (miRol === 'SUBADMINISTRADOR') {
                      return !['ADMINISTRADOR FUNDADES', 'SUBADMINISTRADOR FUNDADES', 'SUBADMINISTRADOR', 'ADMINISTRADOR'].includes(u.roles.nombre_rol);
                    }

                    // SUBADMINISTRADOR FUNDADES: no puede ver ADMIN ni SUBADMIN FUNDADES
                    if (miRol === 'SUBADMINISTRADOR FUNDADES') {
                      //console.log('evento: filtrando excepciones de subadmin fundades');
                      return !['ADMINISTRADOR FUNDADES', 'SUBADMINISTRADOR FUNDADES'].includes(u.roles.nombre_rol);
                    }

                    // Otros roles (e.g. ADMINISTRADOR, ADMINISTRADOR FUNDADES): sin restricción
                    return true;
                  });

                  this.usuariosFiltrados = [...this.usuarios];
                  this.updateUsuariosPaginados();
                },
                error: (err) => console.error('Error al obtener usuarios:', err),
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
  }

  editarUsuario(usuario: UsuariosLight): void {
    console.log('Click editar usuario:', usuario.primer_nombre);
  }

  verDetalleUsuario(usuario: UsuariosLight): void {
    console.log('Click detalle usuario:', usuario.primer_nombre);
  }

  private refrescarUsuarios(): void {
    const miCorreo = this.loginService.showUser();
    const miRol = this.loginService.showRole();

    this.usuarioService.listbyEmpresaId(this.miEmpresa.id).subscribe((todas) => {
      this.usuarios = todas.filter(u => {
        if (u.email === miCorreo) return false;

        if (miRol === 'SUBADMINISTRADOR') {
          return !['ADMINISTRADOR FUNDADES', 'SUBADMINISTRADOR FUNDADES', 'SUBADMINISTRADOR', 'ADMINISTRADOR'].includes(u.roles.nombre_rol);
        }

        if (miRol === 'SUBADMINISTRADOR FUNDADES') {
          return !['ADMINISTRADOR FUNDADES', 'SUBADMINISTRADOR FUNDADES'].includes(u.roles.nombre_rol);
        }

        return true;
      });

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
    }
  });

  dialogConfirmation.afterClosed().subscribe(confirmado => {
    if (!confirmado) return;

    const operacion = usuario.estado
      ? this.usuarioService.deshabilitar(usuario.id)
      : this.usuarioService.habilitar(usuario.id);

    operacion.subscribe({
      next: () => {
        console.log(`Usuario ${usuario.primer_nombre} fue ${accion} correctamente`);
        this.refrescarUsuarios(); // actualiza la lista filtrada

        this.dialog.open(ModalExitoComponent, {
          data: {
            titulo: `Usuario ${accion === 'deshabilitar' ? 'deshabilitado' : 'habilitado'}`,
            iconoUrl: '/assets/checkicon.svg'
          }
        });
      },
      error: () => {
        console.error(`Error al ${accion} usuario ${usuario.primer_nombre}`);
      }
    });
  });
}

}
