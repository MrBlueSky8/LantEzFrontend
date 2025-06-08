import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PuestosTrabajo } from '../../../../models/puestos-trabajo';
import { PuestoTrabajoService } from '../../../../services/puesto-trabajo.service';
import { ModalConfirmacionComponent } from '../../../shared/modales/modal-confirmacion/modal-confirmacion.component';
import { ModalExitoComponent } from '../../../shared/modales/modal-exito/modal-exito.component';

@Component({
  selector: 'app-modal-administrar-puesto',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './modal-administrar-puesto.component.html',
  styleUrl: './modal-administrar-puesto.component.css'
})
export class ModalAdministrarPuestoComponent implements OnInit{
  formPuesto!: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<ModalAdministrarPuestoComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      puesto?: PuestosTrabajo;
    },
    private fb: FormBuilder,
    private puestosService: PuestoTrabajoService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.formPuesto =this.fb.group({
      estado: [this.data.puesto?.estado ?? false, Validators.required],
      aprobado: [this.data.puesto?.aprobado ?? false, Validators.required],
    });
  }

  guardar(): void {
    if (this.formPuesto.invalid) return;

    const updatePuesto: PuestosTrabajo = {
      ...this.data.puesto,
      ...this.formPuesto.value,
      fecha_actualizacion: new Date(Date.now())
    };

    this.puestosService.update(updatePuesto).subscribe(() => {
      this.puestosService.list().subscribe(data => {
        this.puestosService.setList(data);
        this.dialogRef.close(true);
      });
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  eliminarPuesto(puesto: PuestosTrabajo): void {
      console.log('Click eliminar puesto:', puesto.nombre_puesto);
      // Intento de eliminación normal
  
      const dialogConfirmationEliminar = this.dialog.open(
        ModalConfirmacionComponent,
        {
          width: 'auto',
          data: {
            titulo: '¿Estás seguro?',
            mensajeSecundario: 'Esta acción no se puede deshacer.'
          },
        }
      );
  
      dialogConfirmationEliminar.afterClosed().subscribe((confirmado) => {
        if (confirmado) {
          this.puestosService.eliminar(puesto.id).subscribe({
            next: () => {
              console.log(`Puesto ${puesto.nombre_puesto} eliminado correctamente`);

              this.puestosService.list().subscribe(data => {
                this.puestosService.setList(data);
                //this.dialogRef.close(true);
              });
  
              const dialogSucces = this.dialog.open(ModalExitoComponent, {
                data: {
                  titulo: 'Puesto eliminado correctamente',
                  iconoUrl: '/assets/checkicon.svg',
                },
              });

              dialogSucces.afterClosed().subscribe(() => {
                this.dialogRef.close();
              });
            },
            error: (err) => {
              console.warn(`Error al eliminar puesto ${puesto.nombre_puesto}`, err);
  
              // Mostrar confirmación para eliminación forzada
              const dialogConfirmacion = this.dialog.open(
                ModalConfirmacionComponent,
                {
                  width: 'auto',
                  data: {
                    titulo: 'No se puede eliminar',
                    mensajeSecundario: `Esta puesto ya fue usado en registros relacionados. ¿Deseas forzar su eliminación? Esta acción puede causar pérdida de datos relacionados.`,
                  },
                }
              );
  
              dialogConfirmacion.afterClosed().subscribe((confirmado) => {
                if (!confirmado) return;
  
                this.puestosService.eliminarCascade(puesto.id).subscribe({
                  next: () => {
                    console.log(
                      `Puesto ${puesto.nombre_puesto} eliminado forzadamente`
                    );

                    this.puestosService.list().subscribe(data => {
                      this.puestosService.setList(data);
                      //this.dialogRef.close(true);
                    });
  
                    const dialogSucces = this.dialog.open(ModalExitoComponent, {
                      data: {
                        titulo: 'Puesto eliminado forzadamente',
                        iconoUrl: '/assets/checkicon.svg',
                      },
                    });

                    dialogSucces.afterClosed().subscribe(() => {
                      this.dialogRef.close();
                    });
                  },
                  error: () => {
                    console.error(
                      `Error al eliminar forzadamente el puesto ${puesto.nombre_puesto}`
                    );
                  },
                });
              });
            },
          });
        } else {
          console.log('Acción cancelada por el usuario.');
        }
      });
    }
}
