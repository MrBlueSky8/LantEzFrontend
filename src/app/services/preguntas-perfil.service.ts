import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Preguntas_perfil } from '../models/preguntas_perfil';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class PreguntasPerfilService {
  private url = `${base_url}/preguntas-perfil`;
  private listaCambio = new Subject<Preguntas_perfil[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Preguntas_perfil[]>(this.url);
  }
  insert(u: Preguntas_perfil) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: Preguntas_perfil[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<Preguntas_perfil>(`${this.url}/${id}`)
  }
  update(u: Preguntas_perfil){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }
  listtipopuesto(){
    return this.http.get<Preguntas_perfil[]>(`${this.url}/tipo/puesto`);
  }
  listartipotrabajor(){
    return this.http.get<Preguntas_perfil[]>(`${this.url}/tipo/trabajador`);
  }
}
