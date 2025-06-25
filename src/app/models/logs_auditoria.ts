import { Usuarios } from "./usuarios";

export class LogsAuditoria {
    id: number = 0;
    usuarios: Usuarios = new Usuarios();
    tipoAccion: string = '';
    accion: string = '';
    moduloAfectado: string = '';
    detalle: string = '';
    fecha: Date = new Date(Date.now());
  }