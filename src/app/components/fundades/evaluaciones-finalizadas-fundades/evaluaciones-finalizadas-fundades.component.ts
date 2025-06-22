import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { getCustomPaginatorIntl } from '../../shared/paginator-config/paginator-intl-es';
import { Empresas } from '../../../models/empresas';
import { PuestosTrabajo } from '../../../models/puestos-trabajo';
import { MatDialog } from '@angular/material/dialog';
import { EmpresasService } from '../../../services/empresas.service';
import { LoginService } from '../../../services/login.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { PuestoTrabajoService } from '../../../services/puesto-trabajo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalPuestoTrabajoFormComponent } from '../../shared/modales/modal-puesto-trabajo/modal-puesto-trabajo-form/modal-puesto-trabajo-form.component';
import { ModalExitoComponent } from '../../shared/modales/modal-exito/modal-exito.component';
import { ModalAsignarPostulantesComponent } from '../../shared/modales/modal-postulante/modal-asignar-postulantes/modal-asignar-postulantes.component';
import { ModalAdministrarPuestoComponent } from '../../admin/modales/modal-administrar-puesto/modal-administrar-puesto.component';

@Component({
  selector: 'app-evaluaciones-finalizadas-fundades',
  imports: [CommonModule, MatPaginatorModule, FormsModule],
  templateUrl: './evaluaciones-finalizadas-fundades.component.html',
  styleUrl: './evaluaciones-finalizadas-fundades.component.css',
  providers: [
    { provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() },
  ],
})
export class EvaluacionesFinalizadasFundadesComponent implements OnInit {
  miEmpresa: Empresas = new Empresas();
  puestosTrabajos: PuestosTrabajo[] = [];
  puestosFiltrados: PuestosTrabajo[] = [];
  puestosPaginados: PuestosTrabajo[] = [];

  filtroBusqueda: string = '';
  pageSize: number = 10;
  pageIndex: number = 0;

  empresas: Empresas[] = [];
  empresaSeleccionadaId: number | null = null;

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
              this.puestosService.listarPuestosFinalizadosByEmpresaId(empresa.id!).subscribe({
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

      this.empresaService.list().subscribe({
      next: (empresasTodas) => {
        this.empresas = empresasTodas;
      },
      error: (err) =>
        console.error('Error al listar empresas para el combo:', err),
    });
  }

  onEmpresaSeleccionadaChange(): void {
    const id = this.empresaSeleccionadaId;
    if (!id || id === this.miEmpresa.id) {
      // Si selecciona su propia empresa (o null), simplemente usar miEmpresa
      this.refrescarPuesto();
      return;
    }

    this.empresaService.listId(id).subscribe({
      next: (empresa) => {
        this.miEmpresa = empresa;
        this.refrescarPuesto();
      },
      error: (err) => console.error('Error al cambiar de empresa:', err),
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
          .listarPuestosFinalizadosByEmpresaId(this.miEmpresa.id)
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
    const segments = this.router.url.split('/');
    const currentSidenav = segments[1]; // sidenav-fundades o sidenav-admin
    const seccionEvaluacion = segments[2]; //.includes('evaluacion') ? 'evaluacion' : 'mis-evaluaciones';

    //console.log('evento: current sidenav: ' + currentSidenav);
    this.router.navigate([`/${currentSidenav}/${seccionEvaluacion}/gestion/puesto`, puesto.id]);
  }

  asignarPuesto(puesto: PuestosTrabajo): void {
    console.log('Click asignar puesto:', puesto.nombre_puesto);

    if (!puesto) return;

    const dialogRef = this.dialog.open(ModalAsignarPostulantesComponent, {
      width: 'auto',
      data: { puesto, verDetalle: false },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        //console.log('Puesto editado');
        // recargar y filtrar
        this.puestosService
          .listarPuestosFinalizadosByEmpresaId(this.miEmpresa.id)
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
          .listarPuestosFinalizadosByEmpresaId(this.miEmpresa.id)
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
          .listarPuestosFinalizadosByEmpresaId(this.miEmpresa.id)
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
      .listarPuestosFinalizadosByEmpresaId(this.miEmpresa.id)
      .subscribe((todas) => {
        this.puestosTrabajos = todas;
        this.pageIndex = 0;
        this.filtrarPuestos();
      });
  }
}

