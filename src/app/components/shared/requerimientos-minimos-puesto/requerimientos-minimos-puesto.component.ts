import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PuestosTrabajo } from '../../../models/puestos-trabajo';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PuestoTrabajoService } from '../../../services/puesto-trabajo.service';
import { RequerimientosMinimosPuestoService } from '../../../services/requerimientos-minimos-puesto.service';
import { PerfilDelPuntoService } from '../../../services/perfil-del-punto.service';
import { Perfil_del_punto } from '../../../models/perfil_del_punto';
import { PreguntasPerfilService } from '../../../services/preguntas-perfil.service';
import { Preguntas_perfil } from '../../../models/preguntas_perfil';
import { Requerimientos_minimos_puesto } from '../../../models/requerimientos_minimos_puesto';
import { MatDialog } from '@angular/material/dialog';
import { ModalConfirmacionComponent } from '../modales/modal-confirmacion/modal-confirmacion.component';
import { ModalExitoComponent } from '../modales/modal-exito/modal-exito.component';
import { UsuariosService } from '../../../services/usuarios.service';
import { LoginService } from '../../../services/login.service';
import { EmpresasService } from '../../../services/empresas.service';
import { Empresas } from '../../../models/empresas';

@Component({
  selector: 'app-requerimientos-minimos-puesto',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './requerimientos-minimos-puesto.component.html',
  styleUrl: './requerimientos-minimos-puesto.component.css',
})
export class RequerimientosMinimosPuestoComponent implements OnInit {
  puesto!: PuestosTrabajo;
  cargando = true;

  preguntasPerfil: Preguntas_perfil[] = [];

  perfilesPorPregunta: { [preguntaId: number]: Perfil_del_punto[] } = {};

  nivelesSeleccionados: { [preguntaId: number]: number } = {};

  estadoPreguntasAbiertas: { [preguntaId: number]: boolean } = {};

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private puestoService: PuestoTrabajoService,
    private preguntaPerfilService: PreguntasPerfilService,
    private perfilPuntoService: PerfilDelPuntoService,
    private requerimientosService: RequerimientosMinimosPuestoService,
    private router: Router,
    private usuarioService: UsuariosService,
    private loginService: LoginService,
    private empresaService: EmpresasService,
  ) {}

  ngOnInit(): void {
    const miRol = this.loginService.showRole();
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.puestoService.listId(+id).subscribe({
        next: (p) => {
          this.puesto = p;

          this.usuarioService
            .findIdEmpresaByEmail(this.loginService.showUser())
            .subscribe({
              next: (idEmpresa) => {
                this.empresaService.listId(idEmpresa).subscribe({
                  next: (empresa) => {
                    if(empresa.id === this.puesto.areas.empresas.id || miRol === 'ADMINISTRADOR FUNDADES' || miRol === 'SUBADMINISTRADOR FUNDADES'){
                      this.cargando = false;
                      console.log('evento: puesto cargado: ' + this.puesto.nombre_puesto);

                      this.cargarPreguntas();
                      this.cargarRequerimientosExistentes(p.id);
                    }else{
                      console.log('evento: puesto no permitido para el usuario: ' + this.puesto.nombre_puesto);
                      this.redireccionarListaPuesto();
                    }
                  },
                  error: (err) =>
                    console.error('Error al obtener empresa:', err),
                });
              },
              error: (err) => console.error('Error al obtener ID:', err),
            });
        },
        error: () => {
          this.cargando = false;
          // manejar error o redirigir
          this.redireccionarListaPuesto();
        },
      });
    }
  }

  cargarPreguntas(): void {
    this.preguntaPerfilService.listtipopuesto().subscribe((preguntas) => {
      this.preguntasPerfil = preguntas;

      // Ahora cargamos perfiles para cada pregunta
      preguntas.forEach((pregunta) => {
        this.estadoPreguntasAbiertas[pregunta.id] = true;
        this.perfilPuntoService
          .listbypreguntaPerfilId(pregunta.id)
          .subscribe((perfiles) => {
            this.perfilesPorPregunta[pregunta.id] = perfiles;
          });
      });

      this.cargando = false;
    });
  }

  cargarRequerimientosExistentes(puestoId: number): void {
    this.requerimientosService
      .listbyPuestoId(puestoId)
      .subscribe((existentes) => {
        existentes.forEach((req) => {
          this.nivelesSeleccionados[req.pregunta_perfil.id] = req.estado
            ? req.resultado_minimo
            : 6;
        });
      });
  }

  // registrar selección de nivel por pregunta
  seleccionarNivel(preguntaId: number, nivel: number): void {
    this.nivelesSeleccionados[preguntaId] = nivel;
  }

  redireccionarListaPuesto(): void {
    const segments = this.router.url.split('/');
    const currentSidenav = segments[1]; // sidenav-fundades o sidenav-admin
    const seccionEmpresa = segments[2]; //.includes('empresas') ? 'empresas' : 'mi-empresa';

    if(this.loginService.showRole() === 'EVALUADOR'){
      this.router.navigate([`/${currentSidenav}/${seccionEmpresa}`]);
    }else{
      //console.log('evento: current sidenav: ' + currentSidenav);
      this.router.navigate([`/${currentSidenav}/${seccionEmpresa}/puestos-trabajo`]);
    }
  }

  // preparar datos para enviar
  guardar(): void {
    const dialogConfirmation = this.dialog.open(ModalConfirmacionComponent, {
      width: 'auto',
      data: {
        titulo: `¿Estás seguro de guardar esta ficha?`,
      },
    });

    dialogConfirmation.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;

      const requerimientosMinimos: Requerimientos_minimos_puesto[] = [];

      this.preguntasPerfil.forEach((pregunta) => {
        let nivelSeleccionado = this.nivelesSeleccionados[pregunta.id];

        if (nivelSeleccionado === undefined) {
          console.warn(
            `Pregunta ${pregunta.pregunta} no tiene nivel seleccionado. Se asignará como N/A.`
          );
          nivelSeleccionado = 6;
        }

        const requerimiento = new Requerimientos_minimos_puesto();
        requerimiento.puestos_trabajo = this.puesto;
        requerimiento.pregunta_perfil = pregunta;
        requerimiento.resultado_minimo = nivelSeleccionado;
        requerimiento.estado = nivelSeleccionado !== 6;
        requerimiento.fecha_update = new Date();

        requerimientosMinimos.push(requerimiento);
      });

      this.requerimientosService
        .upsertMultiple(requerimientosMinimos)
        .subscribe({
          next: () => {
            console.log(
              'Requerimientos mínimos guardados/actualizados correctamente.'
            );
            const dialogSucces = this.dialog.open(ModalExitoComponent, {
              data: {
                titulo: `Ficha actualizada correctamente.`,
                iconoUrl: '/assets/checkicon.svg',
              },
            });

            dialogSucces.afterClosed().subscribe(() => {
              this.redireccionarListaPuesto();
            });
          },
          error: (err) => {
            console.error(
              'Error al guardar/actualizar requerimientos mínimos:',
              err
            );
          },
        });
    });
  }
}
