import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    RouterLink,
    NgIf,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'lant-ez-frontend';

  role: string = '';
  user: string = '';
  currentPath: string = '';
  constructor(private loginService: LoginService) {}

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
}
