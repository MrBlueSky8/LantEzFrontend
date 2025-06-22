import { INavbarData } from "./helper";

export const navbarData: INavbarData[] = [
    {
        routeLink: 'homes',
        svgIcon: '../../../assets/Home.svg',
        svgIconActive: '../../../assets/Home-hoverBlue.svg',
        //icon: 'fal fa-home', // Dashboard
        label: 'Home',
    },
    {
        routeLink: 'logs',
        svgIcon: '../../../assets/logs.svg',
        svgIconActive: '../../../assets/logs-hoverBlue.svg',
        //icon: 'fa fa-industry', 
        label: 'Logs',
        dividerAfter: true,
    },
    {
        routeLink: 'dashboard',
        svgIcon: '../../../assets/dashboard.svg',
        svgIconActive: '../../../assets/dashboard-hoverBlue.svg',
        //icon: 'fal fa-briefcase', 
        label: 'Dashboard',
    },
    {
        routeLink: 'mi-empresa',
        svgIcon: '../../../assets/empresas.svg', 
        svgIconActive: '../../../assets/empresas-hoverBlue.svg',
        label: 'Mi Empresa',
    },
    {
        routeLink: 'usuarios',
        svgIcon: '../../../assets/users.svg',
        svgIconActive: '../../../assets/users-hoverBlue.svg',
        label: 'Usuarios'
    },
    {
        routeLink: 'postulantes',
        svgIcon: '../../../assets/postulante.svg',
        svgIconActive: '../../../assets/postulante-hoverBlue.svg',
        label: 'Postulantes',
    },
    {
        routeLink: 'evaluadores',
        svgIcon: '../../../assets/evaluadores.svg',
        svgIconActive: '../../../assets/evaluadores-hoverBlue.svg',
        label: 'Evaluadores',
    },
    {
        routeLink: 'evaluaciones',
        svgIcon: '../../../assets/evaluaciones.svg',
        svgIconActive: '../../../assets/evaluaciones-hoverBlue.svg',
        label: 'Evaluaciones',

         items: [
            {
                routeLink: 'evaluaciones/pendientes',
                icon: 'fal fa-plus-square', // Agregar ofertas
                label: 'Pendientes',
            },
            {
                routeLink: 'evaluaciones/finalizadas',
                icon: 'fal fa-list-ul', // Todas mis ofertas
                label: 'Finalizadas',
            },
        ],
            
        action: () => {
            //console.log('evento: action de ajustes clickeado');
            const sidenavexpanded = document.querySelector('body > app-root > app-sidenav-admin > div.sidenav.sidenav-collapsed');
            const buttonlogo = document.querySelector('div.logo-container > button');

            if (!sidenavexpanded && buttonlogo instanceof HTMLButtonElement) {
                buttonlogo.click();
            }
        }
    },
    {
        routeLink: 'ajustes',
        svgIcon: '../../../assets/settings.svg',
        svgIconActive: '../../../assets/settings-hoverBlue.svg',
        label: 'Ajustes',
        
        items: [
            {
                routeLink: 'ajustes',
                icon: 'fal fa-plus-square', // Agregar ofertas
                label: 'Preferencias',
            },
            {
                //routeLink: 'homes',
                icon: 'fal fa-list-ul', // Todas mis ofertas
                label: 'Cerrar sesión',
                action: () => {
                    //console.log('evento: action de ajustes 2 clickeado');
                    localStorage.clear();
                    window.location.href = '/login';
                }
            },
        ],
            
        action: () => {
            //console.log('evento: action de ajustes clickeado');
            const sidenavexpanded = document.querySelector('body > app-root > app-sidenav-admin > div.sidenav.sidenav-collapsed');
            const buttonlogo = document.querySelector('div.logo-container > button');

            if (!sidenavexpanded && buttonlogo instanceof HTMLButtonElement) {
                buttonlogo.click();
            }
        }
        
    }

    /*ejm con items
    {
        routeLink: 'admin',
        icon: 'fal fa-briefcase', // Ofertas de empleo
        label: 'Mis ofertas',
        items: [
            {
                routeLink: 'offers/insertupdateoffers',
                icon: 'fal fa-plus-square', // Agregar ofertas
                label: 'Agregar ofertas',
            },
            {
                routeLink: 'offers/listdeleteoffers',
                icon: 'fal fa-list-ul', // Todas mis ofertas
                label: 'Ofertas publicadas',
            },
        ]
    }
    */
];
