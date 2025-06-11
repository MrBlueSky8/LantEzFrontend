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
import { ModalConfirmacionComponent } from '../modales/modal-confirmacion/modal-confirmacion.component';
import { ModalExitoComponent } from '../modales/modal-exito/modal-exito.component';
import { ModalPostulanteFindDniComponent } from '../modales/modal-postulante/modal-postulante-find-dni/modal-postulante-find-dni.component';
import { ModalPostulanteFormComponent } from '../modales/modal-postulante/modal-postulante-form/modal-postulante-form.component';

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
    private router: Router
  ) //private route: ActivatedRoute,
  {}

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
                error: (err) =>
                  console.error('Error al obtener postulantes:', err),
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
    this.postulantesFiltrados = this.postulantes.filter(
      (e) =>
        e.primer_nombre?.toLowerCase().includes(filtro) ||
        e.segundo_nombre?.toLowerCase().includes(filtro) ||
        e.apellido_p?.toLowerCase().includes(filtro) ||
        e.apellido_m?.toLowerCase().includes(filtro) ||
        e.numero_doc?.toLowerCase().includes(filtro) ||
        e.telefono?.toLowerCase().includes(filtro)
    );
    this.pageIndex = 0;
    this.updatePostulantesPaginados();
    this.cargarEstadosPostulantes();
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
    const dialogRef = this.dialog.open(ModalPostulanteFindDniComponent, {
      width: 'auto',
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (!resultado) {
        console.log('Modal cerrado sin validar');
        return;
      }

      if (resultado.existe) {
        console.log(
          `El DNI ${resultado.dni} ya existe en el sistema. Se debería asociar al postulante.`
        );
        // Aquí luego llamarás a lógica para asociarlo con la empresa
        this.postulantesService
          .buscarPorDni(resultado.dni)
          .subscribe((postulanteExistente) => {
            if (!postulanteExistente) return;

            this.estadoPostulanteXEmpresaService
              .obtenerEstado(this.miEmpresa.id!, postulanteExistente.id)
              .subscribe({
                next: (yaAsociado) => {
                  if (yaAsociado) {
                    console.log('Postulante ya está afiliado a esta empresa.');
                    // Si quieres puedes abrir un modal informativo aquí
                    return;
                  }

                  const nuevoEstado = {
                    id: 0,
                    postulante: postulanteExistente,
                    empresas: this.miEmpresa,
                    estado: true,
                  };

                  this.estadoPostulanteXEmpresaService
                    .insert(nuevoEstado)
                    .subscribe(() => {
                      console.log(
                        'Postulante ahora está afiliado a la empresa'
                      );
                      this.refrescarPostulante();

                      this.dialog.open(ModalExitoComponent, {
                        data: {
                          titulo: 'Postulante Afiliado Correctamente',
                          iconoUrl: '/assets/checkicon.svg',
                        },
                      });
                    });
                },
                error: (err) => {
                  console.error('Error al consultar afiliación:', err);
                },
              });
          });
      } else {
        console.log(
          `El DNI ${resultado.dni} no existe. Se debería registrar un nuevo postulante.`
        );
        const dialogCrear = this.dialog.open(ModalPostulanteFormComponent, {
              width: 'auto',
              data: { empresa: this.miEmpresa },
            });
        
            dialogCrear.afterClosed().subscribe((resultado) => {
              if (resultado) {
                console.log('Postulante creado');
                this.postulantesService
                  .listbyEmpresaId(this.miEmpresa.id)
                  .subscribe((todas) => {
                    this.postulantes = todas;
                    this.pageIndex = 0;
                    //this.updateEmpresasPaginadas();
                    this.filtrarPostulantes();
                  });
              }
            });
      }
    });
  }

  editarPostulante(postulante: Postulantes): void {
    console.log('Click editar postulante:', postulante.primer_nombre);
    if (!postulante) return;

    const dialogRef = this.dialog.open(ModalPostulanteFormComponent, {
                width: 'auto',
                data: { postulante, verDetalle: false, empresa: this.miEmpresa },
              });
          
              dialogRef.afterClosed().subscribe((resultado) => {
                if (resultado) {
                  //console.log('Puesto editado');
                  // recargar y filtrar
                  this.postulantesService
                    .listbyEmpresaId(this.miEmpresa.id)
                    .subscribe((todas) => {
                      this.postulantes = todas;
                      this.postulantesFiltrados = [...this.postulantes];
                      //this.updateEmpresasPaginadas();
                      this.filtrarPostulantes();
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

  verDetallePostulante(postulante: Postulantes): void {
    console.log('Click detalle postulante:', postulante.primer_nombre);

    if (!postulante) return;

    const dialogRef = this.dialog.open(ModalPostulanteFormComponent, {
                  width: 'auto',
                  data: { postulante, verDetalle: true, empresa: this.miEmpresa },
                });
  }

  private refrescarPostulante(): void {
    this.postulantesService
      .listbyEmpresaId(this.miEmpresa.id)
      .subscribe((todas) => {
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

  ToogleEstadoPostulante(postulante: Postulantes): void { //agregar un ngif para verificar que solo un admin o subadmin pueda exponer
    const estadoActual = this.estadoPostulanteMap[postulante.id];
    const accion = estadoActual ? 'deshabilitar' : 'habilitar';

    const dialogConfirmation = this.dialog.open(ModalConfirmacionComponent, {
      width: 'auto',
      data: {
        titulo: `¿Estás seguro de ${accion} este postulante?`,
      },
    });

    dialogConfirmation.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;

      const operacion = estadoActual
        ? this.estadoPostulanteXEmpresaService.deshabilitarPostulante(
            this.miEmpresa.id!,
            postulante.id
          )
        : this.estadoPostulanteXEmpresaService.habilitarPostulante(
            this.miEmpresa.id!,
            postulante.id
          );

      operacion.subscribe({
        next: () => {
          console.log(
            `Postulante ${postulante.primer_nombre} fue ${accion} correctamente`
          );
          this.refrescarPostulante(); // actualiza la lista y estado

          this.dialog.open(ModalExitoComponent, {
            data: {
              titulo: `Postulante ${
                accion === 'deshabilitar' ? 'deshabilitado' : 'habilitado'
              }`,
              iconoUrl: '/assets/checkicon.svg',
            },
          });
        },
        error: () => {
          console.error(
            `Error al ${accion} postulante ${postulante.primer_nombre}`
          );
        },
      });
    });
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
            console.error(
              `Error al obtener estado del postulante ${postulante.id}:`,
              err
            );
          },
        });
    });
  }
}
