import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  form: FormGroup;
  mensaje: string = '';

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

  ngOnInit(): void {}

  login() {
    if (this.form.invalid) {
      this.mensaje = 'Username y password son obligatorios';
      this.snackBar.open(this.mensaje, 'Aviso', {
        duration: 2000,
      });
      return;
    }

    const request = new JwtRequest();
    request.username = this.form.value.username;
    request.password = this.form.value.password;

    this.loginService.login(request).subscribe(
      (data: any) => {
        localStorage.setItem('token', data.jwttoken);
        this.router.navigate(['homes']);
      },
      (error) => {
        this.mensaje = 'La dirección de correo electrónico o la contraseña no son correctos.';
        this.snackBar.open(this.mensaje, 'Aviso', {
          duration: 2000,
        });
      }
    );
  }

}
