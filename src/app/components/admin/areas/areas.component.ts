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
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getCustomPaginatorIntl } from '../../shared/paginator-config/paginator-intl-es';
import { ModalAreaFormComponent } from '../modales/modal-area/modal-area-form/modal-area-form.component';
import { ɵcamelCaseToDashCase } from '@angular/animations/browser';
import { ModalExitoComponent } from '../../shared/modales/modal-exito/modal-exito.component';

@Component({
  selector: 'app-areas',
  imports: [CommonModule, MatPaginatorModule, FormsModule],
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.css',
  providers: [
    { provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() },
  ],
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
    this.areasFiltradas = this.areas.filter((area) =>
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
    const dialogRef = this.dialog.open(ModalAreaFormComponent, {
      width: 'auto',
      data: { empresa: this.miEmpresa },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        console.log('Area creada');
        this.areaService
          .listbyEmpresaId(this.miEmpresa.id)
          .subscribe((todas) => {
            this.areas = todas;
            this.pageIndex = 0;
            //this.updateEmpresasPaginadas();
            this.filtrarAreas();
          });
      }
    });
  }

  editarArea(area: Areas): void {
    console.log('Click editar área:', area.nombre_area);
    if (!area) return;

    //console.log('evento: enviando empresa a editar: ' + JSON.stringify(empresa));

    const dialogRef = this.dialog.open(ModalAreaFormComponent, {
      width: 'auto',
      data: { area, verDetalle: false },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        console.log('Area editada');
        // recargar y filtrar
        this.areaService.listbyEmpresaId(this.miEmpresa.id).subscribe((todas) => {
          this.areas = todas;
          this.areasFiltradas = [...this.areas];
          //this.updateEmpresasPaginadas();
          this.filtrarAreas();
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

  eliminarArea(area: Areas): void {
    console.log('Click eliminar área:', area.nombre_area);
  }
}
