import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { getCustomPaginatorIntl } from '../paginator-config/paginator-intl-es';
import { Empresas } from '../../../models/empresas';
import { Postulantes } from '../../../models/postulantes';
import { MatDialog } from '@angular/material/dialog';
import { EmpresasService } from '../../../services/empresas.service';
import { LoginService } from '../../../services/login.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { PostulantesService } from '../../../services/postulantes.service';
import { Router } from '@angular/router';
import { EstadoPostulanteXEmpresaService } from '../../../services/estado-postulante-x-empresa.service';

@Component({
  selector: 'app-postulantes',
  imports: [CommonModule, MatPaginatorModule, FormsModule],
  templateUrl: './postulantes.component.html',
  styleUrl: './postulantes.component.css',
  providers: [
    { provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() },
  ],
})
export class PostulantesComponent implements OnInit {
  miEmpresa: Empresas = new Empresas();
  postulantes: Postulantes[] = [];
  postulantesFiltrados: Postulantes[] = [];
  postulantesPaginados: Postulantes[] = [];

  filtroBusqueda: string = '';
  pageSize: number = 10;
  pageIndex: number = 0;

  estadoPostulanteMap: { [postulanteId: number]: boolean } = {};

  constructor(
    private dialog: MatDialog,
    private empresaService: EmpresasService,
    private loginService: LoginService,
    private usuarioService: UsuariosService,
    private postulantesService: PostulantesService,
    private estadoPostulanteXEmpresaService: EstadoPostulanteXEmpresaService,
    private router: Router,
    //private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.usuarioService
          .findIdEmpresaByEmail(this.loginService.showUser())
          .subscribe({
            next: (idEmpresa) => {
              this.empresaService.listId(idEmpresa).subscribe({
                next: (empresa) => {
                  this.miEmpresa = empresa;
                  this.postulantesService.listbyEmpresaId(empresa.id!).subscribe({
                    next: (data: Postulantes[]) => {
                      this.postulantes = data;
                      this.postulantesFiltrados = [...this.postulantes];
                      this.updatePostulantesPaginados();
                      this.cargarEstadosPostulantes();
                    },
                    error: (err) => console.error('Error al obtener postulantes:', err),
                  });
                },
                error: (err) => console.error('Error al obtener empresa:', err),
              });
            },
            error: (err) => console.error('Error al obtener ID:', err),
          });
  }

  filtrarPostulantes(): void {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.postulantesFiltrados = this.postulantes.filter((e) =>
      e.primer_nombre?.toLowerCase().includes(filtro) ||
      e.segundo_nombre?.toLowerCase().includes(filtro) ||
      e.apellido_p?.toLowerCase().includes(filtro) ||
      e.apellido_m?.toLowerCase().includes(filtro) ||
      e.numero_doc?.toLowerCase().includes(filtro) ||
      e.telefono?.toLowerCase().includes(filtro)
    );
    this.pageIndex = 0;
    this.updatePostulantesPaginados();
  }

  updatePostulantesPaginados(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.postulantesPaginados = this.postulantesFiltrados.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePostulantesPaginados();
  }

  agregarPostulante(): void {
    console.log('Click agregar postulante');
  }

  editarPostulante(postulante: Postulantes): void {
      console.log('Click editar postulante:', postulante.primer_nombre);
      if (!postulante) return;
  }

  verDetallePostulante(postulante: Postulantes): void {
      console.log('Click detalle postulante:', postulante.primer_nombre);
    
      if (!postulante) return;
  }

  private refrescarPostulante(): void {
    this.postulantesService.listbyEmpresaId(this.miEmpresa.id).subscribe((todas) => {
      this.postulantes = todas;
      this.pageIndex = 0;
      this.filtrarPostulantes();
      this.cargarEstadosPostulantes();
    });
  }

  llenarFichaPostulante(postulante: Postulantes): void {
    console.log('Click llenar Ficha postulante:', postulante.primer_nombre);
    if (!postulante) return;
  }

  ToogleEstadoPostulante(postulante: Postulantes): void {
      console.log('Click toogle postulante:', postulante.primer_nombre);
      if (!postulante) return;
  }

  private cargarEstadosPostulantes(): void {
    this.postulantes.forEach((postulante) => {
      this.estadoPostulanteXEmpresaService
        .obtenerEstado(this.miEmpresa.id!, postulante.id)
        .subscribe({
          next: (estado) => {
            this.estadoPostulanteMap[postulante.id] = estado;
          },
          error: (err) => {
            console.error(`Error al obtener estado del postulante ${postulante.id}:`, err);
          }
        });
    });
  }


}
