import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { LoginService } from './services/login.service';
import { filter } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { UsuariosService } from './services/usuarios.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDialogModule
    //RouterLink,
    //NgIf,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'lant-ez-frontend';

  role: string = '';
  user: string = '';
  currentPath: string = '';
  constructor(
    private loginService: LoginService,
    private router: Router,
    private usuariosService: UsuariosService,

  ) { }

  ngOnInit(): void {
    //this.currentPath = window.location.pathname;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentPath = event.urlAfterRedirects;

      if(this.loginService.showUser()){
        this.usuariosService
        .findIdByEmail(this.loginService.showUser())
        .subscribe({
          next: (id) => {
            this.usuariosService.isEmpresaDeshabilitada(id).subscribe((estaDeshabilitada) => {
              if (estaDeshabilitada) {
                console.warn('La empresa está deshabilitada.');
                //sessionStorage.clear();
                this.router.navigate(['/login']);
              } else {
                //console.log('La empresa está activa.');
              }
            });
          },
          error: (err) => console.error('Error al obtener ID:', err),
        });
      }

      //console.log('cambiando current path: ' + this.currentPath);
      if (this.currentPath === '/homes') {
        //console.log('evento: xD, ruta no valida ingresada, ejecutando redirección');
        const rol = this.loginService.showRole();
        if (rol) {
          this.RedirectByRole(rol);
        }
      }
    });
  }

  cerrar() {
    localStorage.clear();
  }

  verificar() {
    this.role = this.loginService.showRole();
    this.user = this.loginService.showUser();
    this.currentPath = window.location.pathname;
    //console.log('evento: cambio de path a: ' + this.currentPath);
    return this.loginService.verificar();
  }
  isAdmin() {
    return this.role === 'ADMIN';
  }

  RedirectByRole(data: string) {
    switch (data) {
      case 'ADMINISTRADOR FUNDADES':
        // Redirige al dashboard de administrador
        this.router.navigate(['/sidenav-fundades']);
        break;

      case 'SUBADMINISTRADOR FUNDADES':
        // Redirige al panel de subadministrador
        this.router.navigate(['/sidenav-fundades']);
        break;

      case 'ADMINISTRADOR':
        // Redirige al dashboard de administrador
        this.router.navigate(['/sidenav-admin']);
        break;

      case 'SUBADMINISTRADOR':
        // Redirige al panel de subadministrador
        this.router.navigate(['/sidenav-admin']);
        break;

      case 'EVALUADOR':
        // Redirige a la vista del evaluador
        this.router.navigate(['/sidenav-evaluador']);
        break;

      default:
        // Redirige a una página de error o login por defecto
        this.router.navigate(['/login']);
        break;
    }
  }
}
