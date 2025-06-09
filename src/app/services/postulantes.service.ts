import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Postulantes } from '../models/postulantes';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class PostulantesService {
  private url = `${base_url}/postulantes`;
  private listaCambio = new Subject<Postulantes[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Postulantes[]>(this.url);
  }
  insert(u: Postulantes) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: Postulantes[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<Postulantes>(`${this.url}/${id}`)
  }
  update(u: Postulantes){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }

  listbyEmpresaId(id: number) {
    return this.http.get<Postulantes[]>(`${this.url}/empresa/${id}`);
  }
}
