import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PostulantexDiscapacidad } from '../models/postulantex_discapacidad';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class PostulanteXDiscapacidadService {
  private url = `${base_url}/postulantexdiscapacidad`;
  private listaCambio = new Subject<PostulantexDiscapacidad[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<PostulantexDiscapacidad[]>(this.url);
  }
  insert(u: PostulantexDiscapacidad) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: PostulantexDiscapacidad[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<PostulantexDiscapacidad>(`${this.url}/${id}`)
  }
  update(u: PostulantexDiscapacidad){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }
}
