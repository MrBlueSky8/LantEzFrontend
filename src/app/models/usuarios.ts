import { Empresas } from "./empresas";
import { Roles } from "./roles";
import { TipoDocumento } from "./tipo-documento";

export class Usuarios {
    id: number = 0;
    email: string = '';
    password: string = '';
    primer_nombre: string = '';
    segundo_nombre: string = '';
    apellido_p: string = '';
    apellido_m: string = '';
    genero: string = '';
    prefijo_telefono: string = '';
    telefono: string = '';
    fecha_registro: Date= new Date(Date.now());
    tipoDocumento: TipoDocumento = new TipoDocumento();
    numero_doc: string = '';
    fechanacimiento: Date = new Date(Date.now());
    roles: Roles = new Roles();
    empresas: Empresas = new Empresas();
    estado: boolean = false;
  }
  