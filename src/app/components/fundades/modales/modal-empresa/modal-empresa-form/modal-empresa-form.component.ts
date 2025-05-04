import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Empresas } from '../../../../../models/empresas';
import { EmpresasService } from '../../../../../services/empresas.service';
import { TipoSectorService } from '../../../../../services/tipo-sector.service';
import { CiudadesService } from '../../../../../services/ciudades.service';
import { Ciudades } from '../../../../../models/ciudades';
import { TipoSector } from '../../../../../models/tipo-sector';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-modal-empresa-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './modal-empresa-form.component.html',
  styleUrl: './modal-empresa-form.component.css'
})
export class ModalEmpresaFormComponent implements OnInit{

  formEmpresa!: FormGroup;
  esEdicion = false;
  ciudades: Ciudades[] = [];
  tiposSectores: TipoSector[] = [];
  //id: number = 0;

  constructor(
    private dialogRef: MatDialogRef<ModalEmpresaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { empresa?: Empresas },
    private fb: FormBuilder,
    private empresaService: EmpresasService,
    private tiposSectorService: TipoSectorService,
    private ciudadesService: CiudadesService,
  ) {}

  ngOnInit(): void {

    this.tiposSectorService.list().subscribe((data) => {
      this.tiposSectores = data;
    });

    this.ciudadesService.list().subscribe((data) => {
      this.ciudades = data;
    });

    this.esEdicion = !!this.data.empresa;

    /*
    if(this.esEdicion){
      //this.id = this.data.empresa?.id || 0;
    }
      */
     this.formEmpresa =this.fb.group({
      nombre: [this.data.empresa?.nombre || '', Validators.required],
      ruc: [this.data.empresa?.ruc || '', [Validators.required, Validators.maxLength(20), Validators.pattern('^[a-zA-Z0-9]*$')]],
      razon_social: [this.data.empresa?.razon_social || '', [Validators.required, Validators.maxLength(250)]],
      direccion: [this.data.empresa?.direccion || '', Validators.maxLength(250)],
      prefijo_telefono: [this.data.empresa?.prefijo_telefono || '', Validators.maxLength(5)],
      telefono: [this.data.empresa?.telefono || '', [Validators.required, Validators.maxLength(15)]],
      email_contacto: [this.data.empresa?.email_contacto || '', [Validators.required, Validators.email]],
      sector_id: [this.data.empresa?.tiposector.id || '', Validators.required],
      ciudad_id: [this.data.empresa?.ciudades.id || '', Validators.required],
      logo_url: [this.data.empresa?.logo_url || '', [Validators.maxLength(500), Validators.pattern(/^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+[/#?]?.*$/)]],
      descripcion: [this.data.empresa?.descripcion || '', Validators.maxLength(500)],
      num_empleados: [this.data.empresa?.num_empleados || '', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]],
      web_url: [this.data.empresa?.web_url || '', [Validators.maxLength(500), Validators.pattern(/^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+[/#?]?.*$/)]],

      estado: [this.data.empresa?.estado ?? true, Validators.required],

     });
  }

  guardar(): void {
    if (this.formEmpresa.invalid) {
      console.log('evento: form invalid');
      return;
    }
    //const selecttiposector: TipoSector = new TipoSector();
    //selecttiposector.id = this.formEmpresa.value.sector_id;
    const nuevaEmpresa: Empresas = {
      ...this.data.empresa,
      ...this.formEmpresa.value,
      //estado: true,
      tiposector: this.tiposSectores.find(s => s.id === this.formEmpresa.value.sector_id)!,
      ciudades: this.ciudades.find(c => c.id === this.formEmpresa.value.ciudad_id)!,
      fecha_registro: this.data.empresa?.fecha_registro || new Date(Date.now()),
    };
    delete (nuevaEmpresa as any).sector_id;
    delete (nuevaEmpresa as any).ciudad_id;

    console.log('evento insertando objeto empresa: ' + JSON.stringify(nuevaEmpresa));

    const obs = this.esEdicion
      ? this.empresaService.update(nuevaEmpresa)
      : this.empresaService.insert(nuevaEmpresa);

      obs.subscribe(() => {
        // Después del insert/update, actualizar la lista compartida
        this.empresaService.list().subscribe((data) => {
          this.empresaService.setList(data);
          this.dialogRef.close(true); // cerrar el modal después de actualizar la lista
        });
      });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

}
