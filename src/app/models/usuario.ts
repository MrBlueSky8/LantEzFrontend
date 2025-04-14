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
    
    enabled: boolean = false;
  }
  