import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { TipoDiscapacidad } from '../models/tipo-discapacidad';
import { HttpClient } from '@angular/common/http';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class TipoDiscapacidadService {
  private url = `${base_url}/tipodiscapacidad`;
  private listaCambio = new Subject<TipoDiscapacidad[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<TipoDiscapacidad[]>(this.url);
  }
  insert(u: TipoDiscapacidad) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: TipoDiscapacidad[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<TipoDiscapacidad>(`${this.url}/${id}`)
  }
  update(u: TipoDiscapacidad){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }

  listByPostulanteId(postulanteId: number) {
    return this.http.get<TipoDiscapacidad[]>(`${this.url}/postulante/${postulanteId}`);
  }
}
