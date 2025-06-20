import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UsuariosService } from '../../../services/usuarios.service';
import { LoginService } from '../../../services/login.service';
import { ModalConfirmacionComponent } from '../modales/modal-confirmacion/modal-confirmacion.component';
import { switchMap } from 'rxjs';
import { Usuarios } from '../../../models/usuarios';
import { ModalExitoComponent } from '../modales/modal-exito/modal-exito.component';

@Component({
  selector: 'app-ajustes-generales',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './ajustes-generales.component.html',
  styleUrl: './ajustes-generales.component.css'
})
export class AjustesGeneralesComponent {

  constructor(
    private dialog: MatDialog,
    private usuarioService: UsuariosService,
    private loginService: LoginService
  ) {}

  restablecerPassword(): void {
    const dialogRef = this.dialog.open(ModalConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: '¿Estás seguro de restablecer tu contraseña?',
        mensajeSecundario: 'Tu nueva contraseña será tu número de documento.',
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) {
        return;
      }

      const email = this.loginService.showUser();
      this.usuarioService.findIdByEmail(email).pipe(
        // 1) obtener usuario completo por su ID
        switchMap(id => this.usuarioService.listId(id)),
        // 2) actualizar la password
        switchMap((usuario: Usuarios) => {
          const actualizado: Usuarios = {
            ...usuario,
            password: usuario.numero_doc
          };
          return this.usuarioService.update(actualizado);
        })
      ).subscribe({
        next: () => {
          this.dialog.open(ModalExitoComponent, {
            width: '300px',
            data: {
              titulo: 'Contraseña restablecida correctamente',
              iconoUrl: '/assets/checkicon.svg'
            }
          });
        },
        error: err => {
          console.error('Error al restablecer contraseña:', err);
        }
      });
    });
  }
}
