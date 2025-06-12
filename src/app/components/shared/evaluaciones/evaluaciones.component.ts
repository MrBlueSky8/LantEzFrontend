import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { getCustomPaginatorIntl } from '../paginator-config/paginator-intl-es';
import { Empresas } from '../../../models/empresas';
import { PuestosTrabajo } from '../../../models/puestos-trabajo';
import { MatDialog } from '@angular/material/dialog';
import { EmpresasService } from '../../../services/empresas.service';
import { LoginService } from '../../../services/login.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { PuestoTrabajoService } from '../../../services/puesto-trabajo.service';
import { ModalPuestoTrabajoFormComponent } from '../modales/modal-puesto-trabajo/modal-puesto-trabajo-form/modal-puesto-trabajo-form.component';
import { ModalExitoComponent } from '../modales/modal-exito/modal-exito.component';
import { ModalAdministrarPuestoComponent } from '../../admin/modales/modal-administrar-puesto/modal-administrar-puesto.component';

@Component({
  selector: 'app-evaluaciones',
  imports: [CommonModule, MatPaginatorModule, FormsModule],
  templateUrl: './evaluaciones.component.html',
  styleUrl: './evaluaciones.component.css',
  providers: [
    { provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() },
  ],
})
export class EvaluacionesComponent implements OnInit {
  miEmpresa: Empresas = new Empresas();
  puestosTrabajos: PuestosTrabajo[] = [];
  puestosFiltrados: PuestosTrabajo[] = [];
  puestosPaginados: PuestosTrabajo[] = [];

  filtroBusqueda: string = '';
  pageSize: number = 10;
  pageIndex: number = 0;

  constructor(
    private dialog: MatDialog,
    private empresaService: EmpresasService,
    private loginService: LoginService,
    private usuarioService: UsuariosService,
    private puestosService: PuestoTrabajoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.usuarioService
      .findIdEmpresaByEmail(this.loginService.showUser())
      .subscribe({
        next: (idEmpresa) => {
          this.empresaService.listId(idEmpresa).subscribe({
            next: (empresa) => {
              this.miEmpresa = empresa;
              this.puestosService.listbyEmpresaId(empresa.id!).subscribe({
                next: (data: PuestosTrabajo[]) => {
                  this.puestosTrabajos = data;
                  this.puestosFiltrados = [...this.puestosTrabajos];
                  this.updatePuestosPaginados();
                },
                error: (err) => console.error('Error al obtener puestos:', err),
              });
            },
            error: (err) => console.error('Error al obtener empresa:', err),
          });
        },
        error: (err) => console.error('Error al obtener ID:', err),
      });
  }

  filtrarPuestos(): void {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.puestosFiltrados = this.puestosTrabajos.filter(
      (puestos) =>
        puestos.nombre_puesto?.toLowerCase().includes(filtro) ||
        puestos.usuarios.primer_nombre?.toLowerCase().includes(filtro) ||
        puestos.usuarios.segundo_nombre?.toLowerCase().includes(filtro) ||
        puestos.usuarios.apellido_p?.toLowerCase().includes(filtro) ||
        puestos.usuarios.apellido_m?.toLowerCase().includes(filtro) ||
        puestos.usuarios.numero_doc?.toLowerCase().includes(filtro)
    );
    this.pageIndex = 0;
    this.updatePuestosPaginados();
  }

  updatePuestosPaginados(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.puestosPaginados = this.puestosFiltrados.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePuestosPaginados();
  }

  editarPuesto(puesto: PuestosTrabajo): void {
    console.log('Click editar puesto:', puesto.nombre_puesto);
    if (!puesto) return;

    const dialogRef = this.dialog.open(ModalPuestoTrabajoFormComponent, {
      width: 'auto',
      data: { puesto, verDetalle: false },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        //console.log('Puesto editado');
        // recargar y filtrar
        this.puestosService
          .listbyEmpresaId(this.miEmpresa.id)
          .subscribe((todas) => {
            this.puestosTrabajos = todas;
            this.puestosFiltrados = [...this.puestosTrabajos];
            //this.updateEmpresasPaginadas();
            this.filtrarPuestos();
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

  ingresarPuesto(puesto: PuestosTrabajo): void {
    console.log('Click ingresar puesto:', puesto.nombre_puesto);

    if (!puesto) return;
  }

  asignarPuesto(puesto: PuestosTrabajo): void {
    console.log('Click asignar puesto:', puesto.nombre_puesto);

    if (!puesto) return;
  }

  administrarPuesto(puesto: PuestosTrabajo): void {
    console.log('Click administrar puesto:', puesto.nombre_puesto);
    if (!puesto) return;

    const dialogRef = this.dialog.open(ModalAdministrarPuestoComponent, {
      width: 'auto',
      data: { puesto },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        //console.log('Puesto editado');
        // recargar y filtrar
        this.puestosService
          .listbyEmpresaId(this.miEmpresa.id)
          .subscribe((todas) => {
            this.puestosTrabajos = todas;
            this.puestosFiltrados = [...this.puestosTrabajos];
            //this.updateEmpresasPaginadas();
            this.filtrarPuestos();
          });

        const dialogSucces = this.dialog.open(ModalExitoComponent, {
          data: {
            titulo: 'Información Actualizada',
            iconoUrl: '/assets/checkicon.svg', // ../../../assets/
            //mensajeSecundario: 'Te enviamos un correo electrónico con un enlace para reestablecer la contraseña. '
          },
        });
      } else {
        this.puestosService
          .listbyEmpresaId(this.miEmpresa.id)
          .subscribe((todas) => {
            this.puestosTrabajos = todas;
            this.puestosFiltrados = [...this.puestosTrabajos];
            //this.updateEmpresasPaginadas();
            this.filtrarPuestos();
          });
      }
    });
  }

  private refrescarPuesto(): void {
    this.puestosService
      .listbyEmpresaId(this.miEmpresa.id)
      .subscribe((todas) => {
        this.puestosTrabajos = todas;
        this.pageIndex = 0;
        this.filtrarPuestos();
      });
  }
}
