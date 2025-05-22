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
    this.usuarioService
      .findIdEmpresaByEmail(this.loginService.showUser())
      .subscribe({
        next: (idEmpresa) => {
          this.empresaService.listId(idEmpresa).subscribe({
            next: (empresa) => {
              this.miEmpresa = empresa;
              this.usuarioService.listbyEmpresaId(empresa.id!).subscribe({
                next: (data: UsuariosLight[]) => {
                  this.usuarios = data;
                  this.usuariosFiltrados = [...this.usuarios];
                  this.updateUsuariosPaginados();
                },
                error: (err) => console.error('Error al obtener áreas:', err),
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
        e.telefono?.toLowerCase().includes(filtro)
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
    this.usuarioService.listbyEmpresaId(this.miEmpresa.id).subscribe((todas) => {
      this.usuarios = todas;
      this.pageIndex = 0;
      this.filtrarUsuarios();
    });
  }

  deshabilitarUsuario(usuario: UsuariosLight): void {
      console.log('Click deshabilitar usuario:', usuario.primer_nombre);
  }
}
