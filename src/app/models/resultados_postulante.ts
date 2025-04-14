import { Empresas } from "./empresas";
import { Postulantes } from "./postulantes";
import { Preguntas_perfil } from "./preguntas_perfil";

export class Resultados_Postulante {
    id: number = 0;
    postulante: Postulantes = new Postulantes();
    pregunta_perfil: Preguntas_perfil = new Preguntas_perfil();
    resultado_pregunta_obtenido: number = 0;
    fecha_resultado: Date = new Date(Date.now());
    empresas: Empresas = new Empresas();
}