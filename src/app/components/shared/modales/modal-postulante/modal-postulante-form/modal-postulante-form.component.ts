import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TipoDocumento } from '../../../../../models/tipo-documento';
import { Empresas } from '../../../../../models/empresas';
import { Ciudades } from '../../../../../models/ciudades';
import { Pais } from '../../../../../models/pais';
import { Postulantes } from '../../../../../models/postulantes';
import { PostulantesService } from '../../../../../services/postulantes.service';
import { TipoDocumentoService } from '../../../../../services/tipo-documento.service';
import { LoginService } from '../../../../../services/login.service';
import { EmpresasService } from '../../../../../services/empresas.service';
import { PaisService } from '../../../../../services/pais.service';
import { CiudadesService } from '../../../../../services/ciudades.service';
import { EstadoPostulanteXEmpresaService } from '../../../../../services/estado-postulante-x-empresa.service';
import { EstadoPostulanteXEmpresa } from '../../../../../models/estado_postulanteX_empresa';
import { delay, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-modal-postulante-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './modal-postulante-form.component.html',
  styleUrl: './modal-postulante-form.component.css'
})
export class ModalPostulanteFormComponent implements OnInit {

  formPostulante!: FormGroup;
  esEdicion = false;
  tipoDocumentos: TipoDocumento[] = [];
  ciudades: Ciudades[] = [];

  paises: Pais[] = [];
  //empresas: Empresas[] = [];

  miEmpresa: Empresas = new Empresas();

  listaGeneros: { value: string; viewvalue: string }[] = [
    { value: 'Masculino', viewvalue: 'Masculino' },
    { value: 'Femenino', viewvalue: 'Femenino' },
  ];

  constructor(
    private dialogRef: MatDialogRef<ModalPostulanteFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { postulante?: Postulantes, empresa?: Empresas, verDetalle?: boolean },
    private fb: FormBuilder,
    private postulanteService: PostulantesService,
    private tipoDocumentoService: TipoDocumentoService,
    private loginService: LoginService,
    private empresaService: EmpresasService, 
    private paisService: PaisService,
    private ciudadService: CiudadesService,  
    private estadoPostulanteXEmpresaService: EstadoPostulanteXEmpresaService,
  ) {}

  ngOnInit(): void {
    this.esEdicion = !!this.data.postulante;

    this.tipoDocumentoService.list().subscribe((data) => {
      this.tipoDocumentos = data;
    });

    this.paisService.list().subscribe((data) => {
      this.paises = data;
    });

    this.formPostulante = this.fb.group({
        email: [this.data.postulante?.email || '', [Validators.required, Validators.email]],
        primer_nombre: [this.data.postulante?.primer_nombre || '', Validators.required],
        segundo_nombre: [this.data.postulante?.segundo_nombre || ''],
        apellido_p: [this.data.postulante?.apellido_p || '', Validators.required],
        apellido_m: [this.data.postulante?.apellido_m || ''],
        foto_url: [this.data.postulante?.foto_url || '', [Validators.maxLength(500), Validators.pattern(/^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+[/#?]?.*$/)]],
        genero: [this.data.postulante?.genero || ''],
        prefijo_telefono: [this.data.postulante?.prefijo_telefono || '', Validators.maxLength(5)],
        telefono: [this.data.postulante?.telefono || '', Validators.maxLength(15)],
        tipo_documento_id: [this.data.postulante?.tipoDocumento.id || '', Validators.required],
        numero_doc: [this.data.postulante?.numero_doc || '', Validators.required],
        fechanacimiento: [this.data.postulante?.fechanacimiento || '', [Validators.required, this.validarFechaNacimiento]],
        pais_id: [this.data.postulante?.ciudades.pais.id || '', Validators.required],
        ciudad_id: [this.data.postulante?.ciudades.id || '', Validators.required],
        direccion: [this.data.postulante?.direccion || ''],
        fecha_registro: [this.formatDateTime(this.data.postulante?.fecha_registro || new Date()), Validators.required],
        //estado: [this.data.postulante?.estado ?? true, Validators.required],

      });

      this.formPostulante.get('pais_id')?.valueChanges.subscribe(paisId => {
        if (paisId) {
          this.ciudadService.listByPaisId(paisId).subscribe((data) => {
            this.ciudades = data;
            // Resetear ciudad si no pertenece al nuevo país
            const ciudadSeleccionada = this.formPostulante.get('ciudad_id')?.value;
            if (!this.ciudades.find(c => c.id === ciudadSeleccionada)) {
              this.formPostulante.patchValue({ ciudad_id: '' });
            }
          });
        } else {
          this.ciudades = [];
          this.formPostulante.patchValue({ ciudad_id: '' });
        }
      });


  }

  guardar(): void {
    if (this.formPostulante.invalid) return;

    const nuevoPostulante: Postulantes = {
      ...this.data.postulante,
      ...this.formPostulante.value,
      tipoDocumento: this.tipoDocumentos.find(s => s.id === this.formPostulante.value.tipo_documento_id)!,
      ciudades: this.ciudades.find(s => s.id === this.formPostulante.value.ciudad_id)!,
      fecha_registro: this.data.empresa?.fecha_registro || new Date(Date.now()),
    };
    delete (nuevoPostulante as any).tipo_documento_id;
    delete (nuevoPostulante as any).ciudad_id;
    delete (nuevoPostulante as any).pais_id;

    const obs = this.esEdicion
      ? this.postulanteService.update(nuevoPostulante).pipe(switchMap(() => of(null))) // en edición, no se asocia nada
      : this.postulanteService.insert(nuevoPostulante).pipe(
          switchMap(() =>
            this.postulanteService.buscarPorDni(nuevoPostulante.numero_doc)
          ),
          switchMap((postulanteCreado) => {
            //console.log('evento: postulante creado info: ' + JSON.stringify(postulanteCreado));
            if (!postulanteCreado) return of(null); // fallback defensivo

            const estadoNuevo: EstadoPostulanteXEmpresa = {
              id: 0,
              postulante: postulanteCreado,
              empresas: this.data.empresa!,
              estado: true
            };

            return this.estadoPostulanteXEmpresaService.insert(estadoNuevo);
          })
        );

    obs.subscribe(() => {
      this.postulanteService.list().subscribe(data => {
        this.postulanteService.setList(data);
        this.dialogRef.close(true);
      });
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  private formatDateTime(date: Date): string {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
  }

  validarFechaNacimiento(control: any) {
    const fecha = new Date(control.value);
    const hoy = new Date();
    const edadMinima = 18;

    if (fecha > hoy) {
      return { fechaFutura: true };
    }

    const edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    const dia = hoy.getDate() - fecha.getDate();

    const edadFinal = mes < 0 || (mes === 0 && dia < 0) ? edad - 1 : edad;

    if (edadFinal < edadMinima) {
      return { menorDeEdad: true };
    }

    return null;
  }

  limpiarCamposEditables(): void {
    this.formPostulante.patchValue({
      email: '',
      primer_nombre: '',
      segundo_nombre: '',
      apellido_p: '',
      apellido_m: '',
      foto_url: '',
      genero: '',
      prefijo_telefono: '',
      telefono: '',
      tipo_documento_id: '',
      numero_doc: '',
      fechanacimiento: '',
      pais_id: '',
      ciudad_id: '',
      direccion: ''
      
    });

  this.formPostulante.markAsPristine();
  this.formPostulante.markAsUntouched();
  this.ciudades = [];
}
}
