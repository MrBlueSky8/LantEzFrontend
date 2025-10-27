import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { JwtRequest } from '../../models/jwtRequest';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    NgIf,
    ReactiveFormsModule,
    MatSelectModule,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  mensaje: string = '';
  showPass = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void { }

  // Getters opcionales (útiles en el template si los quieres usar)
  get f() { return this.form.controls; }
  get username() { return this.form.get('username'); }
  get password() { return this.form.get('password'); }

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mensaje = 'El e-mail y la contraseña son obligatorios.';
      this.autoClearMensaje();
      return;
    }

    const request = new JwtRequest();
    request.username = this.form.value.username;
    request.password = this.form.value.password;

    this.loading = true;

    this.loginService.login(request).subscribe({
      next: (data: any) => {
        localStorage.setItem('token', data.jwttoken);
        const role = this.loginService.showRole();
        this.redirectByRole(role);
      },
      error: () => {
        this.mensaje = 'La dirección de correo electrónico o la contraseña no son correctos.';
        this.autoClearMensaje();
        this.loading = false;
      }
    });
  }


  redirectByRole(data: string) {
    switch (data) {
      case 'ADMINISTRADOR FUNDADES':
        // Redirige al dashboard de administrador
        this.router.navigate(['/sidenav-fundades/homes']);
        break;

      case 'SUBADMINISTRADOR FUNDADES':
        // Redirige al panel de subadministrador
        this.router.navigate(['/sidenav-fundades/homes']);
        break;

      case 'ADMINISTRADOR':
        // Redirige al dashboard de administrador
        this.router.navigate(['/sidenav-admin/homes']);
        break;

      case 'SUBADMINISTRADOR':
        // Redirige al panel de subadministrador
        this.router.navigate(['/sidenav-admin/homes']);
        break;

      case 'EVALUADOR':
        // Redirige a la vista del evaluador
        this.router.navigate(['/sidenav-evaluador/homes']);
        break;

      default:
        // Redirige a una página de error o login por defecto
        this.router.navigate(['/login']);
        break;
    }
  }

  private autoClearMensaje(ms: number = 3500) {
    if (!this.mensaje) return;
    setTimeout(() => (this.mensaje = ''), ms);
  }
}
