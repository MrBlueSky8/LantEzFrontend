import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Postulantes } from '../../../models/postulantes';
import { Preguntas_perfil } from '../../../models/preguntas_perfil';
import { Perfil_del_punto } from '../../../models/perfil_del_punto';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PostulantesService } from '../../../services/postulantes.service';
import { PreguntasPerfilService } from '../../../services/preguntas-perfil.service';
import { PerfilDelPuntoService } from '../../../services/perfil-del-punto.service';
import { ResultadosPostulanteService } from '../../../services/resultados-postulante.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { LoginService } from '../../../services/login.service';
import { EmpresasService } from '../../../services/empresas.service';
import { Empresas } from '../../../models/empresas';
import { ModalConfirmacionComponent } from '../modales/modal-confirmacion/modal-confirmacion.component';
import { Resultados_Postulante } from '../../../models/resultados_postulante';
import { ModalExitoComponent } from '../modales/modal-exito/modal-exito.component';

@Component({
  selector: 'app-resultados-postulante',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './resultados-postulante.component.html',
  styleUrl: './resultados-postulante.component.css'
})
export class ResultadosPostulanteComponent implements OnInit {
  postulante!: Postulantes;
  cargando = true;

  preguntasPerfil: Preguntas_perfil[] = [];

  perfilesPorPregunta: { [preguntaId: number]: Perfil_del_punto[] } = {};

  nivelesSeleccionados: { [preguntaId: number]: number } = {};

  estadoPreguntasAbiertas: { [preguntaId: number]: boolean } = {};

  empresaSeleccionada!: Empresas;

  resultadosParalelos: boolean = false;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private postulanteService: PostulantesService,
    private preguntaPerfilService: PreguntasPerfilService,
    private perfilPuntoService: PerfilDelPuntoService,
    private resultadosPostulanteService: ResultadosPostulanteService,
    private router: Router,
    private usuarioService: UsuariosService,
    private loginService: LoginService,
    private empresaService: EmpresasService,
  ) { }

  ngOnInit(): void { //falta proteger contra modificar fichas de otras empresas sin autorizacion

    const id = this.route.snapshot.paramMap.get('id');
    const empresaId = this.route.snapshot.paramMap.get('empresaId');

    if (id && empresaId) {
      this.postulanteService.listId(+id).subscribe({
        next: (p) => {
          this.postulante = p;

          this.empresaService.listId(+empresaId).subscribe({
            next: (empresa) => {
              this.cargando = false;
              this.empresaSeleccionada = empresa;
              console.log('evento: puesto cargado: ' + this.postulante.primer_nombre);

              this.cargarPreguntas();
              this.cargarResultadosExistentes(p.id, empresa.id);
            },
            error: (err) => console.error('Error al obtener empresa:', err),
          });


        },
        error: () => {
          this.cargando = false;
          // manejar error o redirigir
          this.redireccionarListaPostulantes();
        },
      });

      this.resultadosPostulanteService.validarFichaEnOtraEmpresa(+id, +empresaId).subscribe({
        next: (resultado) => {
          this.resultadosParalelos = resultado;
        },
        error: (err) => console.error('Error al obtener validacion:', err),
      })
    }
  }

  cargarPreguntas(): void {
    this.preguntaPerfilService.listartipotrabajor().subscribe({
      next: (preguntas) => {
        this.preguntasPerfil = this.ordenarPreguntas(preguntas);

        this.preguntasPerfil.forEach((pregunta) => {
          this.estadoPreguntasAbiertas[pregunta.id] = true;

          this.perfilPuntoService
            .listbypreguntaPerfilId(pregunta.id)
            .subscribe({
              next: (perfiles) => {
                this.perfilesPorPregunta[pregunta.id] = this.ordenarPerfiles(perfiles);
              },
              error: (err) => {
                console.error(
                  `Error al obtener perfiles de la pregunta ${pregunta.id}:`,
                  err
                );
                this.perfilesPorPregunta[pregunta.id] = [];
              },
            });
        });

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener preguntas de perfil:', err);
        this.cargando = false;
      },
    });
  }

  cargarResultadosExistentes(postulanteId: number, empresaId: number): void {
    this.resultadosPostulanteService
      .listByPostulanteAndEmpresa(postulanteId, empresaId)
      .subscribe((existentes) => {
        existentes.forEach((req) => {
          this.nivelesSeleccionados[req.pregunta_perfil.id] = req.resultado_pregunta_obtenido;
        });
      });
  }

  // registrar selección de nivel por pregunta
  seleccionarNivel(preguntaId: number, nivel: number): void {
    this.nivelesSeleccionados[preguntaId] = nivel;
  }

  redireccionarListaPostulantes(): void {
    const segments = this.router.url.split('/');
    const currentSidenav = segments[1]; // sidenav-fundades o sidenav-admin
    //const seccionEmpresa = segments[2]; //.includes('empresas') ? 'empresas' : 'mi-empresa';

    //console.log('evento: current sidenav: ' + currentSidenav);
    this.router.navigate([`/${currentSidenav}/postulantes`]);
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

      const ResultadosObtenidos: Resultados_Postulante[] = [];

      this.preguntasPerfil.forEach((pregunta) => {
        let nivelSeleccionado = this.nivelesSeleccionados[pregunta.id];

        if (nivelSeleccionado === undefined) {
          console.warn(
            `Pregunta ${pregunta.pregunta} no tiene nivel seleccionado. Se asignará como Minimo.`
          );
          nivelSeleccionado = 1;
        }

        const resultado = new Resultados_Postulante();
        resultado.postulante = this.postulante;
        resultado.pregunta_perfil = pregunta;
        resultado.resultado_pregunta_obtenido = nivelSeleccionado;
        resultado.fecha_resultado = new Date();
        resultado.empresas = this.empresaSeleccionada;

        ResultadosObtenidos.push(resultado);
      });

      this.resultadosPostulanteService
        .upsertMultiple(ResultadosObtenidos)
        .subscribe({
          next: () => {
            console.log(
              'Resultados guardados/actualizados correctamente.'
            );
            const dialogSucces = this.dialog.open(ModalExitoComponent, {
              data: {
                titulo: `Ficha actualizada correctamente.`,
                iconoUrl: '/assets/checkicon.svg',
              },
            });

            dialogSucces.afterClosed().subscribe(() => {
              this.redireccionarListaPostulantes();
            });
          },
          error: (err) => {
            console.error(
              'Error al guardar/actualizar resultados:',
              err
            );
          },
        });
    });
  }

  sincronizarResultadosParalelos(): void {

    const dialogConfirmation = this.dialog.open(ModalConfirmacionComponent, {
      width: 'auto',
      data: {
        titulo: `¿Sincronizar ficha postulante?`,
        mensajeSecundario: `Este postulante tiene una ficha en otra empresa asociada. ¿Deseas sincronizar los resultados?`
      },
    });


    dialogConfirmation.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      this.resultadosPostulanteService.obtenerEmpresaIdDeFicha(this.postulante.id).subscribe({
        next: (empresaParalelaId) => {
          this.cargarResultadosExistentes(this.postulante.id, empresaParalelaId);
        },
        error: (err) => console.error('Error al obtener validacion:', err),
      })
    });

  }

  private extraerNumeroPregunta(texto: string | null | undefined): number {
    if (!texto) return Number.MAX_SAFE_INTEGER;

    const match = texto.match(/^(\d+)\./);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
  }

  private ordenarPreguntas(preguntas: Preguntas_perfil[]): Preguntas_perfil[] {
    return [...preguntas].sort((a, b) => {
      const numeroA = this.extraerNumeroPregunta(a.pregunta);
      const numeroB = this.extraerNumeroPregunta(b.pregunta);

      if (numeroA !== numeroB) {
        return numeroA - numeroB;
      }

      return a.id - b.id;
    });
  }

  private ordenarPerfiles(perfiles: Perfil_del_punto[]): Perfil_del_punto[] {
    return [...perfiles].sort((a, b) => {
      if (a.n_respuesta !== b.n_respuesta) {
        return a.n_respuesta - b.n_respuesta;
      }

      return a.id - b.id;
    });
  }

  obtenerNumeroPregunta(texto: string): string {
    const match = texto?.match(/^(\d+)\./);
    return match ? match[1] : '';
  }

  obtenerTituloPregunta(texto: string): string {
    if (!texto) return '';
    return texto.replace(/^\d+\.\s*/, '');
  }
}
