import { INavbarData } from "./helper";

export const navbarData: INavbarData[] = [
    {
        routeLink: 'homes',
        svgIcon: '../../../assets/Home.svg',
        svgIconActive: '../../../assets/Home-hover.svg',
        //icon: 'fal fa-home', // Dashboard
        label: 'Home',
        dividerAfter: true,
    },
    {
        routeLink: 'dashboard',
        svgIcon: '../../../assets/dashboard.svg',
        svgIconActive: '../../../assets/dashboard-hover.svg',
        //icon: 'fal fa-briefcase', 
        label: 'Dashboard',
    },
    {
        routeLink: 'mis-trabajos',
        svgIcon: '../../../assets/empresas.svg', 
        svgIconActive: '../../../assets/empresas-hover.svg',
        label: 'Mis Trabajos',
    },
    {
        routeLink: 'postulantes',
        svgIcon: '../../../assets/postulante.svg',
        svgIconActive: '../../../assets/postulante-hover.svg',
        label: 'Postulantes',
    },
    {
        routeLink: 'evaluaciones',
        svgIcon: '../../../assets/evaluaciones.svg',
        svgIconActive: '../../../assets/evaluaciones-hover.svg',
        label: 'Evaluaciones',
    },
    {
        routeLink: 'ajustes',
        svgIcon: '../../../assets/settings.svg',
        svgIconActive: '../../../assets/settings-hover.svg',
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
