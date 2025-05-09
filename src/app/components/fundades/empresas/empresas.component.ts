import { Component, OnInit } from '@angular/core';
import { Empresas } from '../../../models/empresas';
import { EmpresasService } from '../../../services/empresas.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalEmpresaFormComponent } from '../modales/modal-empresa/modal-empresa-form/modal-empresa-form.component';
import { ModalExitoComponent } from '../../shared/modales/modal-exito/modal-exito.component';
import { LoginService } from '../../../services/login.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { forkJoin, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-empresas',
  imports: [
    CommonModule,
    MatPaginatorModule,
    FormsModule,
  ],
  templateUrl: './empresas.component.html',
  styleUrl: './empresas.component.css',
})
export class EmpresasComponent implements OnInit {
  empresas: Empresas[] = [];
  miEmpresa: Empresas = new Empresas();
  empresasFiltradas: Empresas[] = [];
  empresasPaginadas: Empresas[] = [];

  filtroBusqueda: string = '';
  pageSize: number = 6;
  pageIndex: number = 0;

  constructor(
    private dialog: MatDialog,
    private empresaService: EmpresasService,
    private loginService: LoginService,
    private usuarioService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.usuarioService
      .findIdEmpresaByEmail(this.loginService.showUser())
      .pipe(
        switchMap(id =>
          forkJoin({
            miEmpresa: this.empresaService.listId(id),
            todas: this.empresaService.list()
          })
        )
      )
      .subscribe({
        next: ({ miEmpresa, todas }) => {
          this.miEmpresa = miEmpresa;
          // 2) Filtramos tu propia empresa
          this.empresas = todas.filter(e => e.id !== miEmpresa.id);
          this.empresasFiltradas = [...this.empresas];
          this.updateEmpresasPaginadas();
        },
        error: err => console.error('Error inicializando empresas:', err)
      });
    
  }

  filtrarEmpresas(): void {
    const filtro = this.filtroBusqueda.toLowerCase();
  
    this.empresasFiltradas = this.empresas.filter(e =>
      e.nombre?.toLowerCase().includes(filtro) ||
      e.razon_social?.toLowerCase().includes(filtro) ||
      e.ruc?.toLowerCase().includes(filtro)
    );
  
    this.pageIndex = 0;
    this.updateEmpresasPaginadas();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateEmpresasPaginadas();
  }

  updateEmpresasPaginadas(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.empresasPaginadas = this.empresasFiltradas.slice(start, end);
  }

  asignarMiempresa(): void{
    this.usuarioService.findIdEmpresaByEmail(this.loginService.showUser()).subscribe({
      next: (id) => {
        this.empresaService.listId(id).subscribe({
          next: (empresa) => {
            this.miEmpresa = empresa;
            //console.log('evento id de mi empresa: ' + id, 'mi empresa data: ' + JSON.stringify(this.miEmpresa));
          },
          error: (err) => console.error('Error al obtener la empresa:', err)
        });
      },
      error: (err) => console.error('Error al obtener ID de empresa:', err),
    });
  }

  gestionarAreas(): void{
    console.log('evento: click gestionar areas');
  }

  gestionarPuestos(): void{
    console.log('evento: click gestionar puestos');
  }

  editarMiEmpresa(): void{

    this.abrirModalEditar(this.miEmpresa);

  }

  editarEmpresa(empresa: Empresas): void{
    console.log('evento: click editar a la empresa: ' + empresa.nombre);
    this.abrirModalEditar(empresa);
  }

  verDetalleEmpresa(empresa: Empresas): void{
    console.log('evento: click ver Detalle a la empresa: ' + empresa.nombre);
  }

  deshabilitarEmpresa(empresa: Empresas): void{
    console.log('evento: click Deshabilitar a la empresa: ' + empresa.nombre);
  }

  abrirModalCrear(): void {
    const dialogRef = this.dialog.open(ModalEmpresaFormComponent, {
      width: 'auto',
      data: {},
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        console.log('Empresa creada');
        this.empresaService.list().subscribe(todas => {
          this.empresas = todas.filter(e => e.id !== this.miEmpresa.id);
          this.pageIndex = 0;
          this.updateEmpresasPaginadas();
        });
      }
    });
  }

  abrirModalEditar(empresa: Empresas): void {
    //const empresa = this.empresas[0];
    if (!empresa) return;

    //console.log('evento: enviando empresa a editar: ' + JSON.stringify(empresa));

    const dialogRef = this.dialog.open(ModalEmpresaFormComponent, {
      width: 'auto',
      data: { empresa, verDetalle: false }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        console.log('Empresa editada');
        // recargar y filtrar
        this.empresaService.list().subscribe(todas => {
          this.empresas = todas.filter(e => e.id !== this.miEmpresa.id);
          this.updateEmpresasPaginadas();
        });

        if(empresa.id === this.miEmpresa.id){
          this.asignarMiempresa();
        }

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

  onImgError(event: Event): void {
    const element = event.target as HTMLImageElement;
    
    if (!element.src.includes('empresaDefault.png')) {
      element.src = '/assets/empresaDefault.png';
    }
  }
  

}
