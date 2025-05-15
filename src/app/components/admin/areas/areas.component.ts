import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmpresasService } from '../../../services/empresas.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { LoginService } from '../../../services/login.service';
import { Empresas } from '../../../models/empresas';
import { Areas } from '../../../models/area';
import { AreasService } from '../../../services/areas.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-areas',
  imports: [
    CommonModule, 
    MatPaginatorModule,
    FormsModule
  ],
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.css',
})
export class AreasComponent implements OnInit {
  miEmpresa: Empresas = new Empresas();
  areas: Areas[] = [];
  areasFiltradas: Areas[] = [];
  areasPaginadas: Areas[] = [];

  filtroBusqueda: string = '';
  pageSize: number = 10;
  pageIndex: number = 0;

  constructor(
    private dialog: MatDialog,
    private empresaService: EmpresasService,
    private loginService: LoginService,
    private usuarioService: UsuariosService,
    private areaService: AreasService
  ) {}

  ngOnInit(): void {
    this.usuarioService
      .findIdEmpresaByEmail(this.loginService.showUser())
      .subscribe({
        next: (idEmpresa) => {
          this.empresaService.listId(idEmpresa).subscribe({
            next: (empresa) => {
              this.miEmpresa = empresa;
              this.areaService.listbyEmpresaId(empresa.id!).subscribe({
                next: (data: Areas[]) => {
                  this.areas = data;
                  this.areasFiltradas = [...this.areas];
                  this.updateAreasPaginadas();
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

  filtrarAreas(): void {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.areasFiltradas = this.areas.filter(area =>
      area.nombre_area?.toLowerCase().includes(filtro)
    );
    this.pageIndex = 0;
    this.updateAreasPaginadas();
  }

  updateAreasPaginadas(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.areasPaginadas = this.areasFiltradas.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateAreasPaginadas();
  }

  agregarArea(): void {
    console.log('Click agregar área');
  }

  editarArea(area: Areas): void {
    console.log('Click editar área:', area.nombre_area);
  }

  eliminarArea(area: Areas): void {
    console.log('Click eliminar área:', area.nombre_area);
  }
}
