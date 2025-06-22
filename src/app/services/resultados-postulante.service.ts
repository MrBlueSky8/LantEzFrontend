import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Resultados_Postulante } from '../models/resultados_postulante';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class ResultadosPostulanteService {
  private url = `${base_url}/resultadospostulante`;
  private listaCambio = new Subject<Resultados_Postulante[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Resultados_Postulante[]>(this.url);
  }
  insert(u: Resultados_Postulante) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: Resultados_Postulante[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<Resultados_Postulante>(`${this.url}/${id}`)
  }
  update(u: Resultados_Postulante){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }

  listByPostulanteAndEmpresa(postulanteId: number, empresaId: number) {
    return this.http.get<Resultados_Postulante[]>(`${this.url}/postulante/${postulanteId}/empresa/${empresaId}`);
  }

  upsertMultiple(resultados: Resultados_Postulante[]) {
    return this.http.post(`${this.url}/upsert`, resultados);
  }

  contarPostulantesFichadosPorEmpresa(empresaId: number) {
    return this.http.get<number>(`${this.url}/reporte/fichados/empresa/${empresaId}`);
  }

  validarFichaEnOtraEmpresa(postulanteId: number, empresaId: number) {
    return this.http.get<boolean>(`${this.url}/validar/fichaenotraempresa/${postulanteId}/empresa/${empresaId}`);
  }

  obtenerEmpresaIdDeFicha(postulanteId: number) {
    return this.http.get<number>(`${this.url}/empresa-de-ficha/postulante/${postulanteId}`);
  }


}
