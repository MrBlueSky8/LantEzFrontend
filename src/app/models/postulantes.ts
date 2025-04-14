import { Ciudades } from "./ciudades";
import { TipoDocumento } from "./tipo-documento";

export class Postulantes {
  id: number = 0;
  email: string = '';
  primer_nombre: string = '';
  segundo_nombre: string = '';
  apellido_p: string = '';
  apellido_m: string = '';
  genero: string = '';
  prefijo_telefono: string = '';
  telefono: string = '';
  fecha_registro: Date = new Date(Date.now());
  tipoDocumento: TipoDocumento = new TipoDocumento();
  numero_doc: string = '';
  fechanacimiento: Date = new Date(Date.now());
  ciudades: Ciudades = new Ciudades();
  direccion: string = '';
  estado: boolean = false;
}
