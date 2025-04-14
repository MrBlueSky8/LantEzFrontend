import { Ciudades } from "./ciudades";
import { TipoSector } from "./tipo-sector";

export class Empresas {
    id: number = 0;
    nombre: string = '';
    ruc: string = '';
    direccion: string = '';
    prefijo_telefono: string = '';
    telefono: string = '';
    email_contacto: string = '';
    fecha_registro: Date= new Date(Date.now());
    estado: boolean = false;
    razon_social: string = '';
    tiposector: TipoSector = new TipoSector();
    ciudades: Ciudades = new Ciudades();
    logo_url: string = '';
    descripcion: string = '';
    num_empleados: number = 0;
    web_url: string = '';
  }