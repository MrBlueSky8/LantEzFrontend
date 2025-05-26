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
import { PuestosTrabajo } from '../../../models/puestos-trabajo';
import { MatDialog } from '@angular/material/dialog';
import { EmpresasService } from '../../../services/empresas.service';
import { LoginService } from '../../../services/login.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { PuestoTrabajoService } from '../../../services/puesto-trabajo.service';

@Component({
  selector: 'app-puestos-trabajo',
  imports: [CommonModule, MatPaginatorModule, FormsModule],
  templateUrl: './puestos-trabajo.component.html',
  styleUrl: './puestos-trabajo.component.css',
  providers: [
    { provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() },
  ],
})
export class PuestosTrabajoComponent implements OnInit {
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
    private puestosService: PuestoTrabajoService
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
  }

  editarPuesto(puesto: PuestosTrabajo): void {
      console.log('Click editar puesto:', puesto.nombre_puesto);
      if (!puesto) return;
  
  }

  verDetallePuesto(puesto: PuestosTrabajo): void {
    console.log('Click detalle puesto:', puesto.nombre_puesto);
  
    if (!puesto) return;
  }

  private refrescarPuesto(): void {
    this.puestosService.listbyEmpresaId(this.miEmpresa.id).subscribe((todas) => {
      this.puestosTrabajos = todas;
      this.pageIndex = 0;
      this.filtrarPuestos();
    });
  }

  llenarFichaPuesto(puesto: PuestosTrabajo): void {
      console.log('Click llenar Ficha puesto:', puesto.nombre_puesto);
      if (!puesto) return;
  
  }

  eliminarPuesto(puesto: PuestosTrabajo): void {
    console.log('Click eliminar puesto:', puesto.nombre_puesto);  
  } 

  /*
  toogleEstadoPuesto(puesto: PuestosTrabajo): void {
    const accion = puesto.estado ? 'finalizar' : 'habilitar';

  }
    */
  
}
