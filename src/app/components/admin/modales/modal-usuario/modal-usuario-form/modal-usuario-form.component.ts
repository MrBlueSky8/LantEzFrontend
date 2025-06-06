import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Roles } from '../../../../../models/roles';
import { Empresas } from '../../../../../models/empresas';
import { TipoDocumento } from '../../../../../models/tipo-documento';
import { ModalAreaFormComponent } from '../../modal-area/modal-area-form/modal-area-form.component';
import { Usuarios } from '../../../../../models/usuarios';
import { UsuariosService } from '../../../../../services/usuarios.service';
import { TipoDocumentoService } from '../../../../../services/tipo-documento.service';
import { RolesService } from '../../../../../services/roles.service';
import { EmpresasService } from '../../../../../services/empresas.service';
import { UsuariosLight } from '../../../../../models/usuariosLight';
import { LoginService } from '../../../../../services/login.service';

@Component({
  selector: 'app-modal-usuario-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './modal-usuario-form.component.html',
  styleUrl: './modal-usuario-form.component.css'
})
export class ModalUsuarioFormComponent implements OnInit{

  formUsuario!: FormGroup;
  esEdicion = false;
  tipoDocumentos: TipoDocumento[] = [];
  roles: Roles[] = [];
  //empresas: Empresas[] = [];

  miEmpresa: Empresas = new Empresas();

  listaGeneros: { value: string; viewvalue: string }[] = [
    { value: 'Masculino', viewvalue: 'Masculino' },
    { value: 'Femenino', viewvalue: 'Femenino' },
  ];

  constructor(
    private dialogRef: MatDialogRef<ModalAreaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario?: UsuariosLight, empresa?: Empresas, verDetalle?: boolean },
    private fb: FormBuilder,
    private usuarioService: UsuariosService,
    private tipoDocumentoService: TipoDocumentoService,
    private rolesService: RolesService,
    private loginService: LoginService,
    private empresaService: EmpresasService, 
  ) {}
  
  ngOnInit(): void {
    this.tipoDocumentoService.list().subscribe((data) => {
      this.tipoDocumentos = data;
    });

    this.rolesService.list().subscribe((data) => {
      const idEmpresa = this.data.empresa?.id || this.data.usuario?.empresas?.id;

      if (!idEmpresa) {
        this.roles = data.filter(r => r.nombre_rol !== 'ADMINISTRADOR FUNDADES' && r.nombre_rol !== 'SUBADMINISTRADOR FUNDADES'); // seguridad por defecto
        return;
      }

      this.usuarioService.validarPrivilegiosEmpresa(idEmpresa).subscribe(tienePrivilegios => {
        if (tienePrivilegios) {
          this.roles = data.filter(rol => rol.nombre_rol !== 'ADMINISTRADOR' && rol.nombre_rol !== 'SUBADMINISTRADOR' && rol.nombre_rol !== 'ADMINISTRADOR FUNDADES'); // incluye todos
        } else {

          this.usuarioService
                .findIdEmpresaByEmail(this.loginService.showUser())
                .subscribe({
                  next: (idEmpresaUsuario) => {
                    this.empresaService.listId(idEmpresaUsuario).subscribe({
                      next: (empresaUsuario) => {
                        this.miEmpresa = empresaUsuario;

                         this.usuarioService.validarPrivilegiosEmpresa(this.miEmpresa.id).subscribe(tienePrivilegiosEspeciales => {
                          if(tienePrivilegiosEspeciales){
                            console.log('evento: fundades asistiendo a otra empresa');
                            this.roles = data.filter(rol => rol.nombre_rol !== 'ADMINISTRADOR FUNDADES' && rol.nombre_rol !== 'SUBADMINISTRADOR FUNDADES'); // excluye ADMIN y SUBADMIN Fundades
                          }else{
                            this.roles = data.filter(rol => rol.nombre_rol !== 'ADMINISTRADOR FUNDADES' && rol.nombre_rol !== 'SUBADMINISTRADOR FUNDADES' && rol.nombre_rol !== 'ADMINISTRADOR'); // excluye ADMIN y SUBADMIN Fundades y admin
                          }
                         });
                      },
                      error: (err) => console.error('Error al obtener empresa:', err),
                    });
                  },
                  error: (err) => console.error('Error al obtener ID:', err),
                });

          //this.roles = data.filter(rol => rol.nombre_rol !== 'ADMINISTRADOR FUNDADES' && rol.nombre_rol !== 'SUBADMINISTRADOR FUNDADES' && rol.nombre_rol !== 'ADMINISTRADOR'); // excluye ADMIN y SUBADMIN Fundades
        }
      });
    });

    /*
    this.empresaService.list().subscribe((data) => {
      this.empresas = data;
    });
    */

    this.esEdicion = !!this.data.usuario;

    if(this.esEdicion){
      this.formUsuario = this.fb.group({
        email: [this.data.usuario?.email || '', [Validators.required, Validators.email]],
        primer_nombre: [this.data.usuario?.primer_nombre || '', Validators.required],
        segundo_nombre: [this.data.usuario?.segundo_nombre || ''],
        apellido_p: [this.data.usuario?.apellido_p || '', Validators.required],
        apellido_m: [this.data.usuario?.apellido_m || ''],
        foto_url: [this.data.usuario?.foto_url || '', [Validators.maxLength(500), Validators.pattern(/^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+[/#?]?.*$/)]],
        genero: [this.data.usuario?.genero || ''],
        prefijo_telefono: [this.data.usuario?.prefijo_telefono || '', Validators.maxLength(5)],
        telefono: [this.data.usuario?.telefono || '', Validators.maxLength(15)],
        tipo_documento_id: [this.data.usuario?.tipoDocumento.id || '', Validators.required],
        numero_doc: [this.data.usuario?.numero_doc || '', Validators.required],
        fechanacimiento: [this.data.usuario?.fechanacimiento || '', Validators.required],
        rol_id: [this.data.usuario?.roles.id || '', Validators.required],
        //empresa_id: [this.data.usuario?.empresas.id || '', Validators.required],

        estado: [this.data.usuario?.estado ?? true, Validators.required],

        restablecerPassword: [false],
      });
    }else{
      this.formUsuario = this.fb.group({
        email: [this.data.usuario?.email || '', [Validators.required, Validators.email]],
        primer_nombre: [this.data.usuario?.primer_nombre || '', Validators.required],
        segundo_nombre: [this.data.usuario?.segundo_nombre || ''],
        apellido_p: [this.data.usuario?.apellido_p || '', Validators.required],
        apellido_m: [this.data.usuario?.apellido_m || ''],
        foto_url: [this.data.usuario?.foto_url || '', [Validators.maxLength(500), Validators.pattern(/^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+[/#?]?.*$/)]],
        genero: [this.data.usuario?.genero || ''],
        prefijo_telefono: [this.data.usuario?.prefijo_telefono || '', Validators.maxLength(5)],
        telefono: [this.data.usuario?.telefono || '', Validators.maxLength(15)],
        tipo_documento_id: [this.data.usuario?.tipoDocumento.id || '', Validators.required],
        numero_doc: [this.data.usuario?.numero_doc || '', Validators.required],
        fechanacimiento: [this.data.usuario?.fechanacimiento || '', [Validators.required, this.validarFechaNacimiento]],
        rol_id: [this.data.usuario?.roles.id || '', Validators.required],
        //empresa_id: [this.data.usuario?.empresas.id || '', Validators.required],

        estado: [this.data.usuario?.estado ?? true, Validators.required],

        restablecerPassword: [true],
      });
    }

    if(this.data.verDetalle){
      this.formUsuario.disable();
     }
  }

  guardar(): void {
    if (this.formUsuario.invalid) {
      console.log('evento: form invalid');
      return;
    }

    const nuevoUsuario: Usuarios = {
      ...this.data.usuario,
      ...this.formUsuario.value,
      //estado: true,
      tipoDocumento: this.tipoDocumentos.find(s => s.id === this.formUsuario.value.tipo_documento_id)!,
      roles: this.roles.find(c => c.id === this.formUsuario.value.rol_id)!,
      //empresas: this.empresas.find(c => c.id === this.formUsuario.value.empresa_id)!,
      fecha_registro: this.data.empresa?.fecha_registro || new Date(Date.now()),
      empresas: this.data.usuario?.empresas || this.data.empresa!
    };
    delete (nuevoUsuario as any).tipo_documento_id;
    delete (nuevoUsuario as any).rol_id;
    delete (nuevoUsuario as any).empresa_id;

    if(this.formUsuario.value.restablecerPassword){
      console.log('evento: password por defecto Documento del usuario');
      nuevoUsuario.password = nuevoUsuario.numero_doc;
    }

    console.log('evento insertando objeto usuario: ' + JSON.stringify(nuevoUsuario));

    const obs = this.esEdicion
      ? this.usuarioService.update(nuevoUsuario)
      : this.usuarioService.insert(nuevoUsuario);

      obs.subscribe(() => {
        // Después del insert/update, actualizar la lista compartida
        this.usuarioService.listPublico().subscribe((data) => {
          this.usuarioService.setListPublico(data);
          this.dialogRef.close(true); // cerrar el modal después de actualizar la lista
        });
      });
  }

  cerrar(): void {
    this.dialogRef.close();
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
}
