import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PuestosTrabajo } from '../../../models/puestos-trabajo';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PuestoTrabajoService } from '../../../services/puesto-trabajo.service';

@Component({
  selector: 'app-requerimientos-minimos-puesto',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './requerimientos-minimos-puesto.component.html',
  styleUrl: './requerimientos-minimos-puesto.component.css'
})
export class RequerimientosMinimosPuestoComponent implements OnInit{

  puesto!: PuestosTrabajo;
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private puestoService: PuestoTrabajoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.puestoService.listId(+id).subscribe({
        next: (p) => {
          this.puesto = p;
          this.cargando = false;
          console.log('evento: puesto cargado: '+ this.puesto.nombre_puesto);
        },
        error: () => {
          this.cargando = false;
          // manejar error o redirigir
        }
      });
    }
  }

}
