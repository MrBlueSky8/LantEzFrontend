import { INavbarData } from "./helper";

export const navbarData: INavbarData[] = [
    {
        routeLink: 'homes',
        svgIcon: '../../../assets/Home.svg',
        //icon: 'fal fa-home', // Dashboard
        label: 'Home',
    },
    {
        routeLink: 'logs',
        svgIcon: '../../../assets/logs.svg',
        //icon: 'fa fa-industry', 
        label: 'Logs',
    },
    {
        routeLink: 'dashboard',
        svgIcon: '../../../assets/dashboard.svg',
        //icon: 'fal fa-briefcase', 
        label: 'Dashboard',
    },
    {
        routeLink: 'empresas',
        svgIcon: '../../../assets/empresas.svg', 
        label: 'Empresas',
    },
    {
        routeLink: 'usuarios',
        svgIcon: '../../../assets/users.svg',
        label: 'Usuarios'
    },
    {
        routeLink: 'postulantes',
        svgIcon: '../../../assets/postulante.svg',
        label: 'Postulantes',
    },
    {
        routeLink: 'evaluadores',
        svgIcon: '../../../assets/evaluadores.svg',
        label: 'Evaluadores',
    },
    {
        routeLink: 'evaluaciones',
        svgIcon: '../../../assets/evaluaciones.svg',
        label: 'Evaluaciones',
    },
    {
        routeLink: 'ajustes',
        svgIcon: '../../../assets/settings.svg',
        label: 'Ajustes',
        
        items: [
            {
                routeLink: 'ajustes',
                icon: 'fal fa-plus-square', // Agregar ofertas
                label: 'Preferencias',
            },
            {
                //routeLink: 'offers/listdeleteoffers',
                icon: 'fal fa-list-ul', // Todas mis ofertas
                label: 'Cerrar sesión',
                action: () => {
                    console.log('evento: action de ajustes 2 clickeado');
                }
            },
        ],
            
        action: () => {
            console.log('evento: action de ajustes clickeado');
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
