import { Preguntas_perfil } from "./preguntas_perfil";
import { PuestosTrabajo } from "./puestos-trabajo";

export class Requerimientos_minimos_puesto {
    id: number = 0;
    resultado_minimo: number = 0;
    puestos_trabajo: PuestosTrabajo = new PuestosTrabajo();
    pregunta_perfil: Preguntas_perfil = new Preguntas_perfil();
    fecha_update: Date = new Date(Date.now());
    estado: boolean = false;
}