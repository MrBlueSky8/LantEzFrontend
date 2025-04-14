import { Areas } from "./area";
import { Usuarios } from "./usuario";

export class PuestosTrabajo {
    id: number = 0;
    areas: Areas = new Areas();
    usuarios: Usuarios = new Usuarios();
    nombre_puesto: string = '';
    descripcion: string = '';
    fecha_creacion: Date = new Date(Date.now());
    fecha_actualizacion: Date = new Date(Date.now());
    estado: boolean = false;
    aprobado: boolean = false;
    
}