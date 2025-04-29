import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { fadeInOut, INavbarData } from './helper';
import { navbarData } from './nav-data';
import { UsuariosService } from '../../services/usuarios.service';
import { LoginService } from '../../services/login.service';
import { SublevelEvaluadorMenuComponent } from './sublevel-evaluador-menu.component';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav-evaluador',
  imports: [CommonModule, RouterLink, RouterModule, RouterOutlet, SublevelEvaluadorMenuComponent],
  templateUrl: './sidenav-evaluador.component.html',
  styleUrl: './sidenav-evaluador.component.css',
  animations: [
        fadeInOut,
        trigger('rotate', [
          transition(':enter', [
            animate('1000ms',
              keyframes([
                style({transform: 'rotate(0deg)', offset: '0'}),
                style({transform: 'rotate(2turn)', offset: '1'})
              ])
            )
          ])
        ])
      ]
})
export class SidenavEvaluadorComponent implements OnInit{
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  screenWidth = 0;
  navData = navbarData;
  multiple: boolean = false;
  username: string = '';
  userrole:string = '';
  isUsernameOverflow = false;
  isUserroleOverflow = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if(this.screenWidth <= 768 ) {
      this.collapsed = false;
      this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
    }
  }

  constructor(
    public router: Router,
    private usuarioService: UsuariosService,
    private loginService: LoginService

  ) {}

  ngOnInit(): void {
      this.screenWidth = window.innerWidth;

      
      this.usuarioService.findNameByEmail(this.loginService.showUser()).subscribe((data) => {
        this.username = data;
        this.evaluateOverflow();
        //console.log(this.username);
      });

      this.RefactorWordingByRole(this.loginService.showRole());
      //console.log('evento: prueba de refactor ' + this.userrole);
      
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  handleClick(item: INavbarData): void {
    this.shrinkItems(item);
    item.expanded = !item.expanded
  }

  getActiveClass(data: INavbarData): string {
    return this.router.url.includes(data.routeLink ?? '') ? 'active' : '';
  }

  shrinkItems(item: INavbarData): void {
    if (!this.multiple) {
      for(let modelItem of this.navData) {
        if (item !== modelItem && modelItem.expanded) {
          modelItem.expanded = false;
        }
      }
    }
    //console.log('Item clicked:', item);

    if(item.action){
      item.action();
    }
  }

  logout() {
    this.router.navigate(['login']);
  }

  RefactorWordingByRole(data: string) {
    switch (data) {
      case 'ADMINISTRADOR FUNDADES':
        this.userrole = 'Admin';
        break;

      case 'SUBADMINISTRADOR FUNDADES':
        this.userrole = 'SubAdmin';
        break;

      case 'ADMINISTRADOR':
        this.userrole = 'Admin';
        break;

      case 'SUBADMINISTRADOR':
        this.userrole = 'SubAdmin';
        break;

      case 'EVALUADOR':
        this.userrole = 'Evaluador';
        break;

      default:
        this.userrole = 'Sin Privilegios';
        break;
    }
  }

  evaluateOverflow(): void {
    if (this.username.length > 15) { // a que longitud activar overflow
      this.isUsernameOverflow = true;
    }
  
    if (this.userrole.length > 10) { 
      this.isUserroleOverflow = true;
    }
  }

  getIcon(data: INavbarData): string | undefined {
    const isActive = this.router.url.includes(data.routeLink ?? '');
    if (isActive && data.svgIconActive) {
      return data.svgIconActive;
    }
    return data.svgIcon;
  }

}


