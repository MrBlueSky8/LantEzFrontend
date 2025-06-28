import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Postulaciones } from '../models/postulaciones';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class PostulacionesService {
  private url = `${base_url}/postulaciones`;
  private listaCambio = new Subject<Postulaciones[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Postulaciones[]>(this.url);
  }
  insert(u: Postulaciones) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: Postulaciones[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<Postulaciones>(`${this.url}/${id}`)
  }
  update(u: Postulaciones){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }

  insertMultiple(postulaciones: Postulaciones[]) {
    return this.http.post(`${this.url}/multiple`, postulaciones);
  }

  upsertMultiple(postulaciones: Postulaciones[]) {
    return this.http.post(`${this.url}/upsert`, postulaciones);
  }

  listByPuestoTrabajo(puestoId: number) {
    return this.http.get<Postulaciones[]>(`${this.url}/puesto/${puestoId}`);
  }

  contarPostulacionesFinalizadasPorEmpresa(empresaId: number) {
    return this.http.get<number>(`${this.url}/reporte/finalizadas/empresa/${empresaId}`);
  }

  contarPostulacionesPendientesPorEmpresa(empresaId: number) {
    return this.http.get<number>(`${this.url}/reporte/pendientes/empresa/${empresaId}`);
  }

  contarPorUsuarioId(usuarioId: number) {
    return this.http.get<number>(`${this.url}/cantidad/usuario/${usuarioId}`);
  }

  contarNoPendientesPorUsuario(usuarioId: number) {
    return this.http.get<number>(`${this.url}/nopendientes/cantidad/usuario/${usuarioId}`);
  }

  contarPostulacionesAceptadas(usuarioId: number) {
    return this.http.get<number>(`${this.url}/aceptadas/usuario/${usuarioId}`);
  }

  contarPostulacionesRechazadas(usuarioId: number) {
    return this.http.get<number>(`${this.url}/rechazadas/usuario/${usuarioId}`);
  }


}
