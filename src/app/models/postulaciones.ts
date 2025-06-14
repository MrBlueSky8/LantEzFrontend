import { Postulantes } from "./postulantes";
import { PuestosTrabajo } from "./puestos-trabajo";

export class Postulaciones {
  id: number = 0;
  postulante: Postulantes = new Postulantes();
  puesto_trabajo: PuestosTrabajo = new PuestosTrabajo();
  fecha_postulacion: Date = new Date(Date.now());
  estado_postulacion: string = '';
  aprobado: boolean = false;
  porcentaje_compatibilidad: number = 0;
  ia_output: string = '';
  evaluador_comentario: string = '';
  ocultar: boolean = false;
}
