import { Empresas } from "./empresas";
import { Postulantes } from "./postulantes";

export class EstadoPostulanteXEmpresa {
    id: number = 0;
    postulante: Postulantes = new Postulantes();
    empresas: Empresas = new Empresas();
    estado: boolean = false;
}