import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { getCustomPaginatorIntl } from '../paginator-config/paginator-intl-es';
import { Empresas } from '../../../models/empresas';
import { PuestosTrabajo } from '../../../models/puestos-trabajo';
import { MatDialog } from '@angular/material/dialog';
import { EmpresasService } from '../../../services/empresas.service';
import { LoginService } from '../../../services/login.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { PuestoTrabajoService } from '../../../services/puesto-trabajo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalPuestoTrabajoFormComponent } from '../modales/modal-puesto-trabajo/modal-puesto-trabajo-form/modal-puesto-trabajo-form.component';
import { ModalExitoComponent } from '../modales/modal-exito/modal-exito.component';
import { ModalAdministrarPuestoComponent } from '../../admin/modales/modal-administrar-puesto/modal-administrar-puesto.component';

@Component({
  selector: 'app-mis-trabajos',
  imports: [CommonModule, MatPaginatorModule, FormsModule],
  templateUrl: './mis-trabajos.component.html',
  styleUrl: './mis-trabajos.component.css',
  providers: [
    { provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() },
  ],
})
export class MisTrabajosComponent implements OnInit {
  miEmpresa: Empresas = new Empresas();
  puestosTrabajos: PuestosTrabajo[] = [];
  puestosFiltrados: PuestosTrabajo[] = [];
  puestosPaginados: PuestosTrabajo[] = [];

  filtroBusqueda: string = '';
  pageSize: number = 10;
  pageIndex: number = 0;

  userId!: number;

  constructor(
    private dialog: MatDialog,
    private empresaService: EmpresasService,
    private loginService: LoginService,
    private usuarioService: UsuariosService,
    private puestosService: PuestoTrabajoService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    
    this.usuarioService
          .findIdEmpresaByEmail(this.loginService.showUser())
          .subscribe({
            next: (idEmpresa) => {
              this.empresaService.listId(idEmpresa).subscribe({
                next: (empresa) => {
                  this.miEmpresa = empresa;
                  
                },
                error: (err) => console.error('Error al obtener empresa:', err),
              });
            },
            error: (err) => console.error('Error al obtener ID:', err),
          });

     this.usuarioService
      .findIdByEmail(this.loginService.showUser())
      .subscribe({
        next: (id) => {
          this.userId = id;
          this.puestosService.listByUsuarioId(this.userId).subscribe({
                    next: (data: PuestosTrabajo[]) => {
                      this.puestosTrabajos = data;
                      this.puestosFiltrados = [...this.puestosTrabajos];
                      this.updatePuestosPaginados();
                    },
                    error: (err) => console.error('Error al obtener puestos:', err),
                  });
        },
        error: (err) => console.error('Error al obtener ID:', err),
      });

    
          
  }

  filtrarPuestos(): void {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.puestosFiltrados = this.puestosTrabajos.filter((puestos) =>
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

  agregarPuesto(): void {
      console.log('Click agregar puesto');
      const dialogRef = this.dialog.open(ModalPuestoTrabajoFormComponent, {
            width: 'auto',
            data: { empresa: this.miEmpresa },
          });
      
          dialogRef.afterClosed().subscribe((resultado) => {
            if (resultado) {
              console.log('Area creada');
              this.puestosService
                .listByUsuarioId(this.userId)
                .subscribe((todas) => {
                  this.puestosTrabajos = todas;
                  this.pageIndex = 0;
                  //this.updateEmpresasPaginadas();
                  this.filtrarPuestos();
                });
            }
          });
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
                .listByUsuarioId(this.userId)
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

  verDetallePuesto(puesto: PuestosTrabajo): void {
    console.log('Click detalle puesto:', puesto.nombre_puesto);
  
    if (!puesto) return;

     const dialogRef = this.dialog.open(ModalPuestoTrabajoFormComponent, {
              width: 'auto',
              data: { puesto, verDetalle: true },
            });
  }

  private refrescarPuesto(): void {
    this.puestosService.listByUsuarioId(this.userId).subscribe((todas) => {
      this.puestosTrabajos = todas;
      this.pageIndex = 0;
      this.filtrarPuestos();
    });
  }

  llenarFichaPuesto(puesto: PuestosTrabajo): void {
      console.log('Click llenar Ficha puestoo:', puesto.nombre_puesto);
      if (!puesto) return;

      const segments = this.router.url.split('/');
      const currentSidenav = segments[1]; // sidenav-fundades o sidenav-admin
      const seccion = segments[2]; 

      //console.log('evento: current sidenav: ' + currentSidenav);
      this.router.navigate([`/${currentSidenav}/${seccion}/ficha`, puesto.id]);
  
  }

  /*
  toogleEstadoPuesto(puesto: PuestosTrabajo): void {
    const accion = puesto.estado ? 'finalizar' : 'habilitar';

  }
    */
  
}

