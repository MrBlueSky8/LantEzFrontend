import { INavbarData } from "./helper";

export const navbarData: INavbarData[] = [
    {
        routeLink: 'admin',
        icon: 'fal fa-home', // Dashboard
        label: 'Dashboard',
    },
    {
        routeLink: 'evaluador',
        icon: 'fa fa-industry', // Rubros de empresas
        label: 'Rubros'
    },
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
    },
    {
        routeLink: 'evaluador',
        icon: 'fal fa-calendar-alt', // Tipos de trabajos laborales
        label: 'Jornada Laboral',
    },
    {
        routeLink: 'homes',
        icon: 'fal fa-map-marker-alt', // Ubicación de oferta
        label: 'Ubicacion de oferta'
    },
    {
        routeLink: 'homes',
        icon: 'fal fa-file-alt',
        label: 'Ver solicitudes',
        items: [
            {
                routeLink: 'job-applications/listapplications',
                icon: 'fal fa-eye',
                label: 'Solicitudes recibidas',
            },
            {
                routeLink: 'job-applications/accepted-applications',
                icon: 'fal fa-check-circle',
                label: 'Solicitudes Aceptadas',
            }
        ]
    },
    {
        routeLink: 'homes',
        icon: 'fal fa-users', //Posts
        label: 'Preguntas',
    },
    {
        routeLink: 'homes',
        icon: 'fal fa-user-cog', // Mi Cuenta
        label: 'Mi Cuenta',
    }
];
