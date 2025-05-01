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
}
