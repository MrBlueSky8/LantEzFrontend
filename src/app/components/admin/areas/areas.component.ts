import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmpresasService } from '../../../services/empresas.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { LoginService } from '../../../services/login.service';
import { Empresas } from '../../../models/empresas';
import { Areas } from '../../../models/area';
import { AreasService } from '../../../services/areas.service';

@Component({
  selector: 'app-areas',
  imports: [
    CommonModule,

  ],
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.css'
})
export class AreasComponent implements OnInit{
  miEmpresa: Empresas = new Empresas();
  areas: Areas = new Areas();

  constructor(
    private dialog: MatDialog,
    private empresaService: EmpresasService,
    private loginService: LoginService,
    private usuarioService: UsuariosService,
    private areaService: AreasService,
  ) {}

  ngOnInit(): void {
    this.asignarMiempresa();
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


}
