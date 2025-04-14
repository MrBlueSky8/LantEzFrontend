import { Postulantes } from "./postulantes";
import { TipoDiscapacidad } from "./tipo-discapacidad";

export class PostulantexDiscapacidad {
    id: number = 0;
    postulantes: Postulantes = new Postulantes();
    tipoDiscapacidad: TipoDiscapacidad = new TipoDiscapacidad();
}